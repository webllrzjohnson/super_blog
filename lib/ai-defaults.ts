import {
  DEFAULT_CLAUDE_SYSTEM_PROMPT,
  DEFAULT_GROQ_SYSTEM_PROMPT,
  DEFAULT_GROQ_USER_MESSAGE_TEMPLATE,
  DEFAULT_USER_MESSAGE_TEMPLATE,
} from '@/lib/generate-post-prompts'
import { DEFAULT_IMAGE_PROMPT_TEMPLATE } from '@/lib/generate-post-image-prompt'

export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-6'
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
export const DEFAULT_IMAGE_MODEL = 'gpt-image-1'

export const defaultAiSettings = {
  claudeModel: DEFAULT_CLAUDE_MODEL,
  groqModel: DEFAULT_GROQ_MODEL,
  imageModel: DEFAULT_IMAGE_MODEL,
  claudeSystemPrompt: DEFAULT_CLAUDE_SYSTEM_PROMPT,
  groqSystemPrompt: DEFAULT_GROQ_SYSTEM_PROMPT,
  userMessageTemplate: DEFAULT_USER_MESSAGE_TEMPLATE,
  groqUserMessageTemplate: DEFAULT_GROQ_USER_MESSAGE_TEMPLATE,
  imagePromptTemplate: DEFAULT_IMAGE_PROMPT_TEMPLATE,
} as const
