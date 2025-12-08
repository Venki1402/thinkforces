import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role, Attachment } from "../types";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from "../constants";

// Get API key from environment - Vite exposes it via process.env.API_KEY
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "GEMINI_API_KEY is not set. Please create a .env.local file with GEMINI_API_KEY=your_key"
  );
}

// Initialize using process.env.API_KEY directly as per guidelines
const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

let chatSession: Chat | null = null;

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if error is a rate limit error (429)
const isRateLimitError = (error: any): boolean => {
  return (
    error?.status === 429 ||
    error?.code === 429 ||
    error?.message?.includes("429") ||
    error?.message?.toLowerCase().includes("too many requests") ||
    error?.message?.toLowerCase().includes("rate limit")
  );
};

const createChatSession = () => {
  if (!apiKey) {
    throw new Error(
      "API key is not configured. Please set GEMINI_API_KEY in your .env.local file."
    );
  }

  return genAI.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });
};

// Initialize session immediately (will throw if API key is missing)
try {
  chatSession = createChatSession();
} catch (error) {
  console.error("Failed to initialize Gemini chat session:", error);
}

export const initializeGemini = () => {
  // Re-initialize logic if needed.
  chatSession = createChatSession();
};

export const sendMessageStream = async function* (
  text: string,
  attachments: Attachment[] = []
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    throw new Error(
      "API key is not configured. Please set GEMINI_API_KEY in your .env.local file."
    );
  }

  if (!chatSession) {
    try {
      chatSession = createChatSession();
    } catch (error) {
      console.error("Failed to create chat session:", error);
      throw error;
    }
  }

  const parts: any[] = [];

  // Add text part
  if (text) {
    parts.push({ text });
  }

  // Add attachment parts
  for (const att of attachments) {
    // Remove data:image/png;base64, prefix if present for clean base64
    const base64Data = att.data.split(",")[1] || att.data;
    parts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: base64Data,
      },
    });
  }

  // Ensure we have at least one part
  if (parts.length === 0) {
    throw new Error("Message must contain either text or attachments");
  }

  // Retry logic for rate limiting (429 errors)
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const responseStream = await chatSession.sendMessageStream({
        message: parts,
      });

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }

      // Success - exit retry loop
      return;
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error
      if (isRateLimitError(error) && attempt < maxRetries) {
        // Calculate exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Rate limit hit (429). Retrying in ${backoffMs / 1000}s... (attempt ${attempt + 1
          }/${maxRetries + 1})`
        );

        // Yield a message to inform the user
        yield `\n[Rate limit reached. Retrying in ${backoffMs / 1000
          } seconds...]\n`;

        await delay(backoffMs);
        continue; // Retry
      }

      // If not a rate limit error, or we've exhausted retries, handle the error
      console.error("Error sending message to Gemini:", error);

      // Provide more helpful error messages
      if (error?.status === 400 || error?.message?.includes("400")) {
        const errorMessage = error?.message || JSON.stringify(error);
        throw new Error(
          `Bad Request (400): ${errorMessage}. Please check your API key and request format.`
        );
      }

      if (isRateLimitError(error)) {
        throw new Error(
          `Rate limit exceeded (429). Please wait a moment before sending another message. If this persists, you may need to check your API quota or upgrade your plan.`
        );
      }

      // For other errors, throw as-is
      throw error;
    }
  }

  // If we get here, all retries failed
  if (lastError && isRateLimitError(lastError)) {
    throw new Error(
      `Rate limit exceeded after ${maxRetries + 1
      } attempts. Please wait a few minutes before trying again.`
    );
  }
  throw lastError || new Error("Unknown error occurred");
};

export const resetSession = () => {
  initializeGemini();
};
