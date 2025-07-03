# Blog MCP Server 📝

TypeScript로 구현된 블로그 관련 작업을 위한 MCP (Model Context Protocol) 서버입니다.  
n8n webhook을 통해 다양한 블로그 관련 작업을 수행합니다.

## 🚀 기능

이 MCP 서버는 다음과 같은 도구들을 제공합니다:

### 🔒 maskSensitive

- **설명**: 블로그 초안이나 글에서 개인정보(이름, 이메일, 전화번호, 주소), 회사 기밀정보(API 키, 토큰, 내부 데이터), 민감한 비즈니스 정보 등을 자동으로 감지하고 안전하게 마스킹 처리합니다. 공개 게시 전 개인정보 보호와 보안을 위해 사용하세요. 메이아이의 비즈니스 컨텍스트(CCTV 분석, 매장 고객 분석)를 고려하여 적절한 수준으로 마스킹합니다.
- **파라미터**:
  - `content` (필수): 마스킹할 컨텐츠 (블로그 초안 등)

### ✍️ writeDraft

- **설명**: 주어진 주제와 내용을 바탕으로 완성도 높은 블로그 포스트 초안을 생성합니다. 구조화된 글쓰기와 매력적인 서론, 본론, 결론을 포함한 전체 글을 작성할 때 사용하세요.
- **파라미터**:
  - `title` (필수): 초안 작성할 제목
  - `content` (필수): 초안 작성할 내용
  - `keywords` (선택): 타겟 키워드 배열
  - `category` (선택): 카테고리
  - `tags` (선택): 태그 배열

## 🎯 특별한 기능

### 🔄 대화형 처리

- 복잡한 작업을 위한 대화형 webhook 시스템
- 이전 응답을 고려한 연속적인 처리
- 컨텍스트 유지를 통한 더 나은 결과물

### 📦 세션 관리

- 장시간 작업을 위한 세션 상태 관리
- 자동 세션 정리 (30분 타임아웃)
- 작업 히스토리 추적

### 🏢 메이아이 컨텍스트

- 메이아이의 비즈니스 영역 (AI/Computer Vision, CCTV 분석, 매장 고객 분석)을 고려한 마스킹
- 회사 특화 정보 처리

## 🛠 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일을 생성하고 n8n webhook 베이스 URL을 설정하세요:

```bash
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
```

### 3. 빌드

```bash
npm run build
```

### 4. 실행

```bash
npm start
```

## 🔧 개발

### 개발 모드 (watch 모드)

```bash
npm run dev
```

### 빌드 파일 정리

```bash
npm run clean
```

## 📡 n8n Webhook 설정

각 도구는 다음 엔드포인트로 webhook을 호출합니다:

- `POST /mask-sensitive` - 민감 정보 마스킹
- `POST /write-draft` - 블로그 초안 작성

### 대화형 요청 형식

```json
{
  "content": "마스킹할 내용...",
  "company_info": {
    "company_name": "메이아이",
    "industry": "AI/Computer Vision",
    "additional_context": "CCTV 분석, 매장 고객 분석"
  },
  "masking_level": "balanced",
  "preserve_formatting": true,
  "previousResponses": [...],
  "conversationContext": {
    "totalResponses": 2,
    "lastResponse": {...}
  }
}
```

### 예시 Webhook 응답 형식

```json
{
  "success": true,
  "data": {
    "reply": "작업 결과 또는 추가 질문",
    "done": false,
    "missing": ["필요한 추가 정보"],
    "state": {
      "currentStep": "processing",
      "progress": 50
    }
  }
}
```

## 🔌 MCP 클라이언트 설정

### Cursor/Claude Desktop 설정

`~/.cursor/mcp.json` 또는 `~/Library/Application\ Support/Claude/claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "blog-content": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/blog-mcp-demo",
      "env": {
        "N8N_WEBHOOK_BASE_URL": "https://your-n8n-instance.com/webhook"
      }
    }
  }
}
```

## 🏗 프로젝트 구조

```
blog-mcp-demo/
├── src/
│   ├── index.ts      # 메인 MCP 서버
│   ├── types.ts      # 타입 정의 및 툴 스키마
│   └── webhook.ts    # n8n webhook 호출 유틸리티
├── dist/             # 컴파일된 JavaScript 파일
├── package.json      # 프로젝트 설정
├── tsconfig.json     # TypeScript 설정
└── README.md         # 이 파일
```

## 🔒 보안 고려사항

- n8n webhook URL은 환경변수로 관리
- 민감한 정보는 `.env` 파일에 저장하고 `.gitignore`에 추가
- SSL 검증 무시 설정 (개발 환경용)
- webhook 응답 데이터는 적절히 검증 후 사용
- 세션 데이터는 메모리에 저장되며 주기적으로 정리

## 🐛 문제 해결

### 일반적인 문제들

1. **패키지 설치 오류**

   ```bash
   npm cache clean --force
   npm install
   ```

2. **TypeScript 컴파일 오류**

   ```bash
   npm run clean
   npm run build
   ```

3. **MCP 연결 오류**

   - MCP 클라이언트 설정 확인
   - 서버 프로세스가 실행 중인지 확인
   - 로그 메시지 확인

4. **Webhook 호출 오류**
   - `N8N_WEBHOOK_BASE_URL` 환경변수 확인
   - n8n 서버 접근 가능 여부 확인
   - SSL 인증서 설정 확인

### 로그 확인

서버 실행 시 다음과 같은 로그를 확인할 수 있습니다:

```bash
🔗 Calling webhook: maskSensitive
📡 URL: https://bot-n8n:5678/webhook/mask-sensitive
📤 Data: {...}
📥 Response: {...}
🆕 Created new session: uuid-here for tool: maskSensitive
🗑️ Cleaning up expired session: uuid-here
```

## 📄 라이선스

MIT License

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

---

💡 **팁**: 각 도구의 실제 동작은 연결된 n8n workflow에 따라 달라집니다. n8n에서 적절한 workflow를 구성해주세요. 대화형 기능을 활용하면 더 정확하고 상세한 결과를 얻을 수 있습니다.
