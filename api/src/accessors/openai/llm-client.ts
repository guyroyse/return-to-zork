import { ChatOpenAI } from '@langchain/openai'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'

import { OPENAI_API_KEY, OPENAI_MODEL } from '@src/env.js'

let llmClient: BaseChatModel | null = null

export async function fetchLLMClient(): Promise<BaseChatModel> {
  if (!llmClient) llmClient = createLLMClient()
  return llmClient
}

function createLLMClient(): BaseChatModel {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is required')

  return new ChatOpenAI({
    model: OPENAI_MODEL,
    apiKey: OPENAI_API_KEY
  })
}
