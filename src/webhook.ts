import axios from "axios";
import { randomUUID } from "crypto";
import https from "https";
import {
  ConversationalWebhookRequest,
  ConversationalWebhookResponse,
  SessionState,
  WebhookResponse,
} from "./types.js";

// n8n webhook 베이스 URL 설정 (환경변수로 관리)
const BASE_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_BASE_URL || "https://bot-n8n:5678/webhook";

// 각 툴별 경로 정의
const TOOL_PATHS = {
  maskSensitive: "mask-sensitive",
  writeDraft: "write-draft",
} as const;

// SSL 검증 무시를 위한 httpsAgent 설정
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// 세션 상태를 저장하는 메모리 저장소
const sessionStore = new Map<string, SessionState>();

// 세션 정리를 위한 타임아웃 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * 세션 정리 함수 (오래된 세션 제거)
 */
function cleanupSessions() {
  const now = new Date();
  for (const [sessionId, session] of sessionStore.entries()) {
    if (now.getTime() - session.lastActivity.getTime() > SESSION_TIMEOUT) {
      console.log(`🗑️ Cleaning up expired session: ${sessionId}`);
      sessionStore.delete(sessionId);
    }
  }
}

// 주기적으로 세션 정리 (5분마다)
setInterval(cleanupSessions, 5 * 60 * 1000);

/**
 * n8n webhook 호출 함수
 * @param toolName - 호출할 툴 이름
 * @param data - 전송할 데이터
 * @returns Promise<WebhookResponse>
 */
export async function callWebhook(
  toolName: keyof typeof TOOL_PATHS,
  data: any
): Promise<WebhookResponse> {
  const path = TOOL_PATHS[toolName];
  const webhookUrl = `${BASE_WEBHOOK_URL}/${path}`;

  try {
    console.log(`🔗 Calling webhook: ${toolName}`);
    console.log(`📡 URL: ${webhookUrl}`);
    console.log(`📤 Data:`, JSON.stringify(data, null, 2));

    const response = await axios.post(webhookUrl, data, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Blog-MCP-Server/1.0.0",
      },
      timeout: 30000, // 30초 타임아웃
      httpsAgent: httpsAgent, // SSL 검증 무시
    });

    console.log(`📥 Response:`, JSON.stringify(response.data, null, 2));

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`❌ Webhook call failed for ${toolName}:`, error);

    // axios 오류 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 서버가 응답했지만 2xx 범위가 아닌 상태 코드
        const statusCode = error.response.status;
        const statusText = error.response.statusText;
        const errorMessage = `HTTP ${statusCode}: ${statusText}`;
        console.error(`📡 Response Error:`, error.response.data);

        return {
          success: false,
          error: errorMessage,
        };
      } else if (error.request) {
        // 요청은 전송되었으나 응답을 받지 못함
        console.error(`📡 Request Error:`, error.request);
        return {
          success: false,
          error: `네트워크 오류: ${error.message}`,
        };
      } else {
        // 요청 설정 중 오류 발생
        console.error(`⚙️ Config Error:`, error.message);
        return {
          success: false,
          error: `설정 오류: ${error.message}`,
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 대화형 webhook 호출 함수 (이전 응답 포함)
 * @param toolName - 호출할 툴 이름
 * @param request - 요청 데이터
 * @param previousResponses - 이전 응답들 (선택사항)
 * @returns Promise<ConversationalWebhookResponse>
 */
export async function callConversationalWebhook(
  toolName: keyof typeof TOOL_PATHS,
  request: ConversationalWebhookRequest,
  previousResponses?: ConversationalWebhookResponse[]
): Promise<ConversationalWebhookResponse> {
  // 이전 응답들을 포함한 요청 데이터 구성
  const requestWithHistory = {
    ...request,
    previousResponses: previousResponses || [],
    conversationContext: previousResponses
      ? {
          totalResponses: previousResponses.length,
          lastResponse: previousResponses[previousResponses.length - 1],
        }
      : undefined,
  };

  const result = await callWebhook(toolName, requestWithHistory);

  if (!result.success) {
    throw new Error(result.error || "Webhook call failed");
  }

  return result.data as ConversationalWebhookResponse;
}

/**
 * 세션 생성 또는 가져오기
 * @param sessionId - 세션 ID (제공하지 않으면 자동 생성)
 * @param toolName - 툴 이름
 * @returns 세션 상태
 */
export function getOrCreateSession(
  sessionId: string | undefined,
  toolName: string
): SessionState {
  if (!sessionId) {
    sessionId = randomUUID();
  }

  let session = sessionStore.get(sessionId);

  if (!session) {
    session = {
      sessionId,
      toolName,
      currentState: {},
      history: [], // 이전 응답들 저장
      startTime: new Date(),
      lastActivity: new Date(),
    };
    sessionStore.set(sessionId, session);
    console.log(`🆕 Created new session: ${sessionId} for tool: ${toolName}`);
  } else {
    session.lastActivity = new Date();
  }

  return session;
}

/**
 * 민감 정보 마스킹 webhook 호출
 */
export async function maskSensitive(params: {
  content: string;
}): Promise<WebhookResponse> {
  // 요청 데이터 구성
  const requestData = {
    content: params.content,
    company_info: {
      company_name: "메이아이",
      industry: "AI/Computer Vision",
      additional_context: "CCTV 분석, 매장 고객 분석",
    },
    masking_level: "balanced",
    preserve_formatting: true,
  };

  console.log(`🔒 Masking content with balanced level`);

  return callWebhook("maskSensitive", requestData);
}

/**
 * 블로그 초안 작성 webhook 호출
 */
export async function writeDraft(params: {
  title: string;
  content: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
}): Promise<WebhookResponse> {
  return callWebhook("writeDraft", params);
}

/**
 * 완료된 세션 결과를 웹훅으로 보내서 최종 처리
 * @param sessionId - 세션 ID
 * @returns Promise<WebhookResponse>
 */
export async function processCompletedSession(
  sessionId: string
): Promise<WebhookResponse> {
  const session = sessionStore.get(sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const latestResponse = session.history[session.history.length - 1];

  if (!latestResponse || !latestResponse.done) {
    throw new Error("Session is not completed yet");
  }

  const completedData = {
    status: `${session.toolName}-completed`,
    sessionId: sessionId,
    completedState: latestResponse.state,
    toolName: session.toolName,
    startTime: session.startTime,
    endTime: new Date(),
    conversationHistory: session.history.map((h) => ({
      reply: h.reply,
      missing: h.missing,
      done: h.done,
    })),
  };

  console.log(
    `🎯 Processing completed session ${sessionId} for final webhook call`
  );

  try {
    // 완료된 결과를 웹훅으로 보내기
    const result = await callWebhook(
      session.toolName as keyof typeof TOOL_PATHS,
      completedData
    );

    if (result.success) {
      console.log(`✅ Successfully processed completed session ${sessionId}`);
      return result;
    } else {
      console.error(
        `❌ Failed to process completed session ${sessionId}:`,
        result.error
      );
      return result;
    }
  } catch (error) {
    console.error(`❌ Error processing completed session ${sessionId}:`, error);
    throw error;
  }
}
