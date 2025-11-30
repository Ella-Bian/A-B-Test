import { TestConfig, Phase1Result, Phase2Result } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CreateSessionResponse {
  sessionId: string;
  participantId: string;
  message: string;
}

export interface AllSessionsData {
  sessions: Array<{
    id: string;
    participant_id: string;
    testConfig: TestConfig;
    created_at: number;
  }>;
  phase1Results: Phase1Result[];
  phase2Results: Phase2Result[];
  totalParticipants: number;
}

// 创建新测试会话
export async function createSession(testConfig: TestConfig): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ testConfig }),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
}

// 保存Phase1测试结果
export async function savePhase1Results(
  sessionId: string,
  results: Phase1Result[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/phase1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ results }),
  });

  if (!response.ok) {
    throw new Error('Failed to save phase1 results');
  }
}

// 保存Phase2测试结果
export async function savePhase2Results(
  sessionId: string,
  results: Phase2Result[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/phase2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ results }),
  });

  if (!response.ok) {
    throw new Error('Failed to save phase2 results');
  }
}

// 获取所有会话数据（用于分析）
export async function getAllSessionsData(): Promise<AllSessionsData> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`);

  if (!response.ok) {
    throw new Error('Failed to fetch sessions data');
  }

  return response.json();
}

// 获取单个会话数据
export async function getSessionData(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch session data');
  }

  return response.json();
}

