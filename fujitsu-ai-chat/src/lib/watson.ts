/**
 * Watson X Orchestrate API Client
 * Handles authentication, chat completions, and token management.
 * Falls back to mock responses when WATSON_MOCK_MODE=true.
 */

export interface WatsonMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface WatsonSource {
  title: string;
  url?: string;
  snippet: string;
  relevance?: number;
}

export interface WatsonChatResponse {
  content: string;
  sources: WatsonSource[];
  threadId?: string;
  model?: string;
}

// ─── Token Cache ───────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.WATSON_API_KEY;
  const tokenUrl = process.env.WATSON_TOKEN_URL;

  if (!apiKey || !tokenUrl) {
    throw new Error('Watson API key or token URL not configured');
  }

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: apiKey }),
  });

  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${resp.status}`);
  }

  const data = await resp.json();
  cachedToken = data.token;
  // Expire 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken!;
}

// ─── Chat Completions ──────────────────────────────────────────
export async function chatCompletion(
  messages: WatsonMessage[],
  threadId?: string
): Promise<WatsonChatResponse> {
  if (process.env.WATSON_MOCK_MODE === 'true') {
    return mockChatCompletion(messages);
  }

  const token = await getToken();
  const baseUrl = process.env.WATSON_BASE_URL;
  const instanceId = process.env.WATSON_INSTANCE_ID;
  const agentId = process.env.WATSON_AGENT_ID;

  if (!baseUrl || !instanceId || !agentId) {
    throw new Error('Watson X configuration incomplete');
  }

  const url = `${baseUrl}/instances/${instanceId}/v1/orchestrate/${agentId}/chat/completions`;

  const body: Record<string, unknown> = {
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    stream: false,
  };

  if (threadId) {
    body.thread_id = threadId;
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Watson X API error (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  const sources = extractSources(content);

  return {
    content,
    sources,
    threadId: data.thread_id,
    model: data.model,
  };
}

// ─── Source Extraction ─────────────────────────────────────────
function extractSources(text: string): WatsonSource[] {
  const sources: WatsonSource[] = [];

  // Pattern 1: Markdown-style references [title](url)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    sources.push({
      title: match[1],
      url: match[2],
      snippet: getSnippetAround(text, match.index),
    });
  }

  // Pattern 2: Inline URLs
  const urlRegex = /(?:^|\s)(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[1];
    if (!sources.some(s => s.url === url)) {
      sources.push({
        title: extractDomain(url),
        url,
        snippet: getSnippetAround(text, match.index),
      });
    }
  }

  // Pattern 3: "Source:" or "Reference:" lines
  const sourceLineRegex = /(?:source|reference|ref)\s*:\s*(.+)/gi;
  while ((match = sourceLineRegex.exec(text)) !== null) {
    const line = match[1].trim();
    if (!sources.some(s => s.title === line)) {
      sources.push({
        title: line,
        snippet: getSnippetAround(text, match.index),
      });
    }
  }

  return sources;
}

function getSnippetAround(text: string, index: number, radius = 120): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  let snippet = text.slice(start, end).replace(/\n/g, ' ').trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet += '...';
  return snippet;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// ─── Mock Responses ────────────────────────────────────────────
const MOCK_RESPONSES: { pattern: RegExp; response: WatsonChatResponse }[] = [
  {
    pattern: /ai.?act|regulation|compliance|artificial intelligence act/i,
    response: {
      content: `## The EU AI Act — Key Overview

The **EU Artificial Intelligence Act** (AI Act) is the world's first comprehensive legal framework regulating artificial intelligence. It was formally adopted by the European Parliament in March 2024 and entered into force on August 1, 2024.

### Key Provisions

1. **Risk-Based Classification**: AI systems are categorized into four risk levels:
   - 🔴 **Unacceptable Risk** — Banned (e.g., social scoring, manipulative AI)
   - 🟠 **High Risk** — Subject to strict compliance (e.g., hiring tools, credit scoring)
   - 🟡 **Limited Risk** — Transparency obligations (e.g., chatbots must disclose they are AI)
   - 🟢 **Minimal Risk** — No restrictions (e.g., spam filters, video games)

2. **General-Purpose AI Models**: Providers of foundation models (like GPT) must ensure transparency and provide technical documentation.

3. **Enforcement**: The EU AI Office oversees compliance, with penalties up to **€35 million or 7% of global turnover**.

### Timeline
- **February 2025**: Prohibitions on unacceptable-risk AI apply
- **August 2025**: Obligations for general-purpose AI models apply
- **August 2026**: Full enforcement for high-risk AI systems

The AI Act aims to promote trustworthy AI while fostering innovation across the European market.

Source: Official Journal of the European Union, Regulation (EU) 2024/1689
Reference: European Commission AI Act Overview — https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai`,
      sources: [
        {
          title: 'EU AI Act — Official Journal',
          url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
          snippet: 'Regulation (EU) 2024/1689 of the European Parliament laying down harmonised rules on artificial intelligence (Artificial Intelligence Act)',
          relevance: 0.98,
        },
        {
          title: 'European Commission — AI Regulatory Framework',
          url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
          snippet: 'The AI act is the first-ever legal framework on AI, which addresses the risks of AI and positions Europe to play a leading role globally.',
          relevance: 0.95,
        },
        {
          title: 'AI Act Timeline — European Parliament',
          url: 'https://www.europarl.europa.eu/topics/en/article/20230601STO93804',
          snippet: 'The European Parliament approved the AI Act in March 2024, making it the world\'s first comprehensive AI law.',
          relevance: 0.88,
        },
      ],
      model: 'watsonx-ai-agent-mock',
    },
  },
  {
    pattern: /fujitsu|company|about/i,
    response: {
      content: `## About Fujitsu

**Fujitsu Limited** is a leading Japanese global information and communication technology (ICT) company offering a full range of technology products, solutions, and services.

### Key Facts

| Attribute | Details |
|-----------|---------|
| **Founded** | June 20, 1935 |
| **Headquarters** | Minato, Tokyo, Japan |
| **CEO** | Takahito Tokita |
| **Employees** | ~124,000 worldwide |
| **Revenue** | ¥3.7 trillion (FY2024) |

### Core Business Areas

- **Uvance** — Cross-industry digital solutions for sustainability
- **Digital Services** — Consulting, managed services, and cloud solutions
- **Computing** — Supercomputers (Fugaku), quantum computing research
- **AI & Data** — Fujitsu Kozuchi AI platform

### Global Presence
Fujitsu operates in over **100 countries** and is the world's sixth-largest IT services provider. The company is committed to **Purpose-driven innovation** under its vision: *"To make the world more sustainable by building trust in society through innovation."*

Source: Fujitsu Corporate Profile 2024
Reference: Fujitsu Global — https://www.fujitsu.com/global/about/`,
      sources: [
        {
          title: 'Fujitsu Corporate Profile',
          url: 'https://www.fujitsu.com/global/about/',
          snippet: 'Fujitsu\'s purpose is to make the world more sustainable by building trust in society through innovation.',
          relevance: 0.96,
        },
        {
          title: 'Fujitsu Integrated Report 2024',
          url: 'https://www.fujitsu.com/global/about/ir/library/integratedrep/',
          snippet: 'Annual integrated report covering Fujitsu\'s financial and non-financial performance, strategy and governance.',
          relevance: 0.85,
        },
      ],
      model: 'watsonx-ai-agent-mock',
    },
  },
  {
    pattern: /watson|ibm|orchestrate/i,
    response: {
      content: `## IBM watsonx Orchestrate

**IBM watsonx Orchestrate** is an AI-powered automation platform that helps businesses streamline complex processes by orchestrating multiple AI agents and tools.

### Architecture

The platform follows a modular architecture:

\`\`\`
┌─────────────────────────────────────────┐
│           Watson X Orchestrate          │
├─────────────┬─────────────┬─────────────┤
│   AI Agent  │  Tool Layer │  Knowledge  │
│   Engine    │  (Skills)   │  Base (RAG) │
├─────────────┴─────────────┴─────────────┤
│         Foundation Models (LLMs)        │
│    granite · llama · custom models      │
└─────────────────────────────────────────┘
\`\`\`

### Key Capabilities

1. **Agent Builder** — Create AI agents with custom skills and knowledge
2. **Chat Completions API** — OpenAI-compatible endpoint for programmatic access
3. **RAG Integration** — Upload documents to create knowledge bases
4. **Multi-Agent Orchestration** — Chain multiple agents for complex workflows
5. **Enterprise Security** — SOC 2, GDPR, and HIPAA compliant

### API Endpoint Pattern
\`\`\`
POST /instances/{instanceId}/v1/orchestrate/{agentId}/chat/completions
\`\`\`

Source: IBM watsonx Orchestrate Documentation
Reference: IBM Developer — https://developer.ibm.com/products/watsonx-orchestrate`,
      sources: [
        {
          title: 'IBM watsonx Orchestrate Docs',
          url: 'https://www.ibm.com/docs/en/watsonx/watson-orchestrate',
          snippet: 'watsonx Orchestrate uses AI to automate tasks and workflows by connecting multiple AI agents and enterprise tools.',
          relevance: 0.97,
        },
        {
          title: 'watsonx Orchestrate API Reference',
          url: 'https://developer.ibm.com/apis/catalog/watsonx-orchestrate',
          snippet: 'OpenAI-compatible Chat Completions API for programmatic interaction with Watson X agents.',
          relevance: 0.92,
        },
        {
          title: 'IBM watsonx Platform Overview',
          url: 'https://www.ibm.com/watsonx',
          snippet: 'IBM watsonx is an AI and data platform with a set of AI assistants designed for business.',
          relevance: 0.80,
        },
      ],
      model: 'watsonx-ai-agent-mock',
    },
  },
];

const DEFAULT_MOCK: WatsonChatResponse = {
  content: `Thank you for your question. I'm the **Fujitsu AI Assistant**, powered by IBM watsonx.

I can help you with a wide range of topics including:

- 📋 **EU AI Act** — Regulations, compliance requirements, and timelines
- 🏢 **Fujitsu Information** — Products, services, and company details
- 🤖 **Watson X Platform** — Architecture, capabilities, and integration
- 💡 **General Knowledge** — Business, technology, and innovation topics

Could you please provide more details about what you'd like to know? I'll do my best to provide a comprehensive answer with relevant sources.

*This is a demonstration response. Connect to Watson X for live AI-powered answers.*`,
  sources: [
    {
      title: 'Fujitsu AI Assistant — Help Guide',
      snippet: 'The Fujitsu AI Assistant supports questions about regulations, technology, and business operations.',
    },
  ],
  model: 'watsonx-ai-agent-mock',
};

async function mockChatCompletion(
  messages: WatsonMessage[]
): Promise<WatsonChatResponse> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) return DEFAULT_MOCK;

  const query = lastUserMessage.content;

  for (const mock of MOCK_RESPONSES) {
    if (mock.pattern.test(query)) {
      return { ...mock.response, threadId: `mock-thread-${Date.now()}` };
    }
  }

  return { ...DEFAULT_MOCK, threadId: `mock-thread-${Date.now()}` };
}
