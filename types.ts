export type ViewState = 'creator' | 'landing' | 'phase1' | 'phase2' | 'analysis';

export interface ImageAsset {
  id: string;
  url: string;
  group: 'A' | 'B';
}

export interface TestConfig {
  title: string;
  keywords: string[];
  imagesA: ImageAsset[];
  imagesB: ImageAsset[];
}

export interface Phase1Result {
  imageId: string;
  group: 'A' | 'B';
  keyword: string;
  isMatch: boolean;
  reactionTimeMs: number;
  timestamp: number;
}

export interface Phase2Result {
  group: 'A' | 'B';
  selectedKeywords: string[];
}

export interface SessionData {
  participantId: string;
  phase1: Phase1Result[];
  phase2: Phase2Result[];
}

// For Demo purposes, we might preload data
export const DEMO_KEYWORDS = ["Professional", "Trustworthy", "Innovative", "Friendly"];