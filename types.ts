
export enum TestState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  LOADING = 'LOADING'
}

export enum TestCategory {
  GENERAL = 'General',
  TECHNOLOGY = 'Technology',
  LITERATURE = 'Literature',
  CODE = 'Code',
  SCIENCE = 'Science',
  HISTORY = 'History',
  MYTHOLOGY = 'Mythology',
  BUSINESS = 'Business',
  CREATIVE_WRITING = 'Creative Writing',
  PHILOSOPHY = 'Philosophy',
  WORLD_EVENTS = 'World Events'
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  cpm: number;
  longestWord: string;
  errors: number;
  timeSpent: number;
  totalWords: number;
  history: { time: number; wpm: number }[];
}

export interface AIFeedback {
  tips: string[];
  encouragement: string;
}
