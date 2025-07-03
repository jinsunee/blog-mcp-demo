#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOLS } from "./types.js";
import {
  maskSensitive,
  writeDraft
} from "./webhook.js";

/**
 * Blog MCP Server
 * n8n webhook을 통해 블로그 관련 작업을 수행하는 MCP 서버
 */
class BlogMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "blog-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 사용 가능한 툴 목록 반환
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.parameters,
        })),
      };
    });

    // 툴 실행 핸들러
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "maskSensitive": {
            const result = await maskSensitive(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: result.success
                    ? `✅ 민감 정보 마스킹 완료:\n${JSON.stringify(
                        result.data,
                        null,
                        2
                      )}`
                    : `❌ 민감 정보 마스킹 실패: ${result.error}`,
                },
              ],
            };
          }

          case "writeDraft": {
            const result = await writeDraft(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: result.success
                    ? `✅ SEO 최적화 완료:\n${JSON.stringify(
                        result.data,
                        null,
                        2
                      )}`
                    : `❌ SEO 최적화 실패: ${result.error}`,
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `알 수 없는 툴: ${name}`
            );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        throw new McpError(
          ErrorCode.InternalError,
          `툴 실행 중 오류 발생: ${errorMessage}`
        );
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // 프로세스 종료 시 정리 작업
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// 서버 실행
async function main(): Promise<void> {
  const server = new BlogMcpServer();
  await server.run();
}

// 메인 함수 실행
main().catch((error) => {
  console.error("🚨 서버 시작 실패:", error);
  process.exit(1);
});
