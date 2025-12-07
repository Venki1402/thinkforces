export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum InteractionMode {
  GENERAL = 'General Help',
  PROBLEM_SOLVING = 'Problem Solving',
  EDITORIAL = 'Editorial Explainer',
  CODE_REVIEW = 'Code Review',
  PATTERN_COACH = 'Pattern Coach'
}