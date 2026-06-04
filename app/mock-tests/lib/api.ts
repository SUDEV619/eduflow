import apiClient from '@/lib/apiClient';

export interface MockTest {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  exam_type: string;
  subject: string;
  marking: {
    correctPoints: number;
    incorrectPoints: number;
    unansweredPoints: number;
  };
  questions: any[];
}

export const userMockTestApi = {
  getMockTests: async (token?: string, filters: any = {}): Promise<MockTest[]> => {
    const config: any = { params: filters };
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await apiClient.get('/api/mock-tests/', config);
    return res.data;
  },

  getMockTestDetail: async (id: string, token?: string): Promise<MockTest> => {
    const config: any = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await apiClient.get(`/api/mock-tests/${id}/`, config);
    return res.data;
  },

  startAttempt: async (testId: string, token: string): Promise<any> => {
    const res = await apiClient.post(`/api/mock-tests/${testId}/attempt/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  submitAttempt: async (attemptId: number, answers: any, token: string): Promise<any> => {
    const res = await apiClient.post(`/api/mock-tests/attempts/${attemptId}/submit/`, { answers }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
