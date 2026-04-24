import { loadItem, saveItem } from './storage';

const GROQ_KEY_STORAGE = 'groqApiKey';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface GroqChoice {
  message?: {
    content?: string;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
  error?: {
    message?: string;
  };
}

export function getStoredGroqApiKey(): string {
  return loadItem<string>(GROQ_KEY_STORAGE, '');
}

export function saveGroqApiKey(key: string): void {
  saveItem(GROQ_KEY_STORAGE, key.trim());
}

export function clearGroqApiKey(): void {
  saveItem(GROQ_KEY_STORAGE, '');
}

export function getGroqApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY || getStoredGroqApiKey()).trim();
}

export function getGroqModel(): string {
  return import.meta.env.VITE_GROQ_MODEL || DEFAULT_MODEL;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

export async function callGroqJson<T>(
  messages: GroqMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error('Groq API key is not configured.');

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getGroqModel(),
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 900,
      response_format: { type: 'json_object' },
    }),
  });

  const payload = (await response.json()) as GroqResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Groq request failed with ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned an empty response.');

  return JSON.parse(content) as T;
}
