# Blog MCP Server 📝

TypeScript로 구현된 블로그 관련 작업을 위한 MCP (Model Context Protocol) 서버입니다.  
n8n webhook을 통해 다양한 블로그 관련 작업을 수행합니다.

## 🚀 기능

이 MCP 서버는 다음과 같은 도구들을 제공합니다:

### 📋 classifyIdea

- **설명**: 글감을 카테고리·키워드 등으로 정리합니다
- **파라미터**:
  - `content` (필수): 분류할 글감 내용
  - `category` (선택): 원하는 카테고리
  - `keywords` (선택): 관련 키워드 배열

### 🔒 maskSensitive

- **설명**: PII·비밀 키 등 민감 정보를 마스킹합니다
- **파라미터**:
  - `text` (필수): 마스킹할 텍스트

### 🔍 seoTune

- **설명**: SEO 최적화를 위한 제목·내용을 조정합니다
- **파라미터**:
  - `title` (필수): 최적화할 제목
  - `content` (필수): 최적화할 내용
  - `keywords` (선택): 타겟 키워드 배열

### ✍️ draftPost

- **설명**: 블로그 포스트 초안을 작성합니다
- **파라미터**:
  - `title` (필수): 포스트 제목
  - `content` (필수): 포스트 내용
  - `category` (선택): 카테고리
  - `tags` (선택): 태그 배열

## 🛠 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일을 생성하고 n8n webhook URL을 설정하세요:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
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

- `POST /classify-idea` - 글감 분류
- `POST /mask-sensitive` - 민감 정보 마스킹
- `POST /seo-tune` - SEO 최적화
- `POST /draft-post` - 포스트 초안 작성

### 예시 Webhook 응답 형식

```json
{
  "success": true,
  "data": {
    // n8n workflow 결과 데이터
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
        "N8N_WEBHOOK_URL": "https://your-n8n-instance.com/webhook"
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
- webhook 응답 데이터는 적절히 검증 후 사용

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

## 📄 라이선스

MIT License

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

---

💡 **팁**: 각 도구의 실제 동작은 연결된 n8n workflow에 따라 달라집니다. n8n에서 적절한 workflow를 구성해주세요.
