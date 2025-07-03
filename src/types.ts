// 툴 파라미터 타입 정의
export interface ClassifyIdeaParams {
  content: string;
  category?: string;
  keywords?: string[];
}

export interface MaskSensitiveParams {
  text: string;
}

export interface WriteDraftParams {
  title: string;
  content: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
}

// 대화 계속하기 툴 파라미터
export interface ContinueConversationParams {
  sessionId: string;
  userInput: string;
}

// n8n Webhook 응답 타입
export interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 대화형 webhook 시스템을 위한 새로운 타입 정의
export interface ConversationalWebhookRequest {
  status: string;
  text: string;
  state?: Record<string, any>;
}

export interface ConversationalWebhookResponse {
  reply: string;
  done: boolean;
  missing: string[];
  state: Record<string, any>;
}

// 세션 상태 관리를 위한 타입
export interface SessionState {
  sessionId: string;
  toolName: string;
  currentState: Record<string, any>;
  history: ConversationalWebhookResponse[];
  startTime: Date;
  lastActivity: Date;
}

// MCP 툴 정의
export const TOOLS = [
  {
    name: "maskSensitive",
    description:
      "블로그 초안이나 글에서 개인정보(이름, 이메일, 전화번호, 주소), 회사 기밀정보(API 키, 토큰, 내부 데이터), 민감한 비즈니스 정보 등을 자동으로 감지하고 안전하게 마스킹 처리합니다. 공개 게시 전 개인정보 보호와 보안을 위해 사용하세요. 메이아이의 비즈니스 컨텍스트(CCTV 분석, 매장 고객 분석)를 고려하여 적절한 수준으로 마스킹합니다.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "마스킹할 컨텐츠 (블로그 초안 등)",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "writeDraft",
    description:
      "주어진 주제와 내용을 바탕으로 완성도 높은 블로그 포스트 초안을 생성합니다. 구조화된 글쓰기와 매력적인 서론, 본론, 결론을 포함한 전체 글을 작성할 때 사용하세요.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "초안 작성할 제목" },
        content: { type: "string", description: "초안 작성할 내용" },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "타겟 키워드 (선택사항)",
        },
        category: { type: "string", description: "카테고리 (선택사항)" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "태그 (선택사항)",
        },
      },
      required: ["title", "content"],
    },
  },
] as const;
