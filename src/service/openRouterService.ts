// services/openRouterService.ts

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

const CANDIDATE_MODELS = [
  'deepseek/deepseek-chat',
  'meta-llama/llama-3.3-70b-instruct',
  'google/gemini-2.5-flash',
  'openrouter/auto'
];

class OpenRouterService {
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    this.siteName = 'Diagnosely AI - Medical Assistant';
  }

  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": this.siteUrl,
            "X-Title": this.siteName,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data: OpenRouterResponse = await response.json();
          if (data.choices && data.choices.length > 0) {
            const reply = data.choices[0].message.content;
            if (reply && reply.trim().length > 0) {
              return reply;
            }
          }
        }
      } catch (err) {
        console.warn(`OpenRouter model ${model} error:`, err);
      }
    }

    // Smart empathetic local medical assistant response when API models are unavailable
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content.toLowerCase() || '';

    if (lastUserMsg.includes('side effect') || lastUserMsg.includes('medication')) {
      return "Common side effects depend on the specific medication. Always check your prescription label, take medications as directed by your physician, and report any severe reactions (like rash, swelling, or dizziness) to your doctor immediately.";
    }

    if (lastUserMsg.includes('blood pressure') || lastUserMsg.includes('hypertension')) {
      return "Managing blood pressure typically involves maintaining a balanced low-sodium diet, exercising regularly (30 min/day), avoiding tobacco, managing stress, and taking prescribed antihypertensive medications as advised by your doctor.";
    }

    return "Diagnosely Medical Assistant: Thank you for your question! To provide the safest guidance, please ensure you review your symptoms or test results with a qualified healthcare provider. If you're experiencing urgent symptoms, please seek immediate medical attention.";
  }
}

export const openRouterService = new OpenRouterService();