import apiClient from '@/lib/apiClient';

export interface Question {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  created_at: string;
}

export interface MockTest {
  id: number;
  title: string;
  description: string;
  duration: number;
  exam_type: string;
  subject: string;
  is_published: boolean;
  question_count?: number;
  questions?: Question[];
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: {
    page: number;
    total_pages: number;
    count: number;
  };
  message?: string;
}

const handleError = (error: any) => {
  let errorMessage = 'An error occurred';
  if (error.response?.data) {
    const data = error.response.data;
    // Common keys used by DRF and custom error responses
    const rawMsg = data.message || data.detail || data.error || data.non_field_errors;

    if (rawMsg) {
        if (typeof rawMsg === 'object') {
          errorMessage = Object.entries(rawMsg)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          errorMessage = rawMsg;
        }
    } else if (typeof data === 'string') {
        errorMessage = data;
    } else if (Object.keys(data).length > 0) {
        // Fallback for objects with field-specific errors
        errorMessage = Object.entries(data)
            .map(([key, value]) => {
                const valStr = Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                return `${key}: ${valStr}`;
            })
            .join('\n');
    }
  } else if (!error.response && error.message === 'Network Error') {
      errorMessage = 'Connection error. Please ensure the backend server is running.';
  } else if (error.message) {
      errorMessage = error.message;
  }
  throw new Error(errorMessage);
};

export const adminApi = {
  // Question Bank
  getQuestions: async (token: string, filters: any = {}, page = 1): Promise<ApiResponse<Question[]>> => {
    try {
      const { subjects, ...rest } = filters;
      const params = new URLSearchParams({ ...rest, page: String(page) });
      
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        params.append('subjects', subjects.join(','));
      }
      
      const res = await apiClient.get(`/api/admin/questions/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  deleteQuestion: async (token: string, id: number): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.delete(`/api/admin/questions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  bulkDeleteQuestions: async (token: string, questionIds: number[]): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.post(`/api/admin/questions/bulk-delete/`, 
        { question_ids: questionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  createQuestion: async (token: string, data: any): Promise<ApiResponse<Question>> => {
    try {
      const res = await apiClient.post(`/api/admin/questions/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  uploadCSV: async (token: string, file: File): Promise<ApiResponse<any>> => {
    try {
      console.log('Uploading CSV file:', { name: file.name, size: file.size, type: file.type });
      const formData = new FormData();
      formData.append('file', file);

      // Let axios automatically set the Content-Type with boundary for FormData
      const res = await apiClient.post(`/api/admin/questions/upload-csv/`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`
        },
      });
      console.log('Upload response:', res.data);
      return res.data;
    } catch (e: any) {
      console.error('Upload CSV Error:', e.response?.data || e.message);
      handleError(e);
      throw e;
    }
  },
  // Mock Tests
  getMockTests: async (token: string, page = 1, filters: any = {}): Promise<ApiResponse<MockTest[]>> => {
    try {
      const { subjects, ...rest } = filters;
      const params = new URLSearchParams({ ...rest, page: String(page) });
      
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        params.append('subjects', subjects.join(','));
      }
      
      const res = await apiClient.get(`/api/admin/mocktests/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  createMockTest: async (token: string, data: any): Promise<ApiResponse<MockTest>> => {
    try {
      const res = await apiClient.post(`/api/admin/mocktests/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  updateMockTest: async (token: string, id: number, data: any): Promise<ApiResponse<MockTest>> => {
    try {
      const res = await apiClient.patch(`/api/admin/mocktests/${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  getMockTestDetail: async (token: string, id: number): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.get(`/api/admin/mocktests/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  setQuestionsInTest: async (token: string, testId: number, questionIds: number[]): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.post(`/api/admin/mocktests/${testId}/set-questions/`, 
        { question_ids: questionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  addQuestionsToTest: async (token: string, testId: number, questionIds: number[]): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.post(`/api/admin/mocktests/${testId}/add-questions/`, 
        { question_ids: questionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  bulkAddQuestionsToTest: async (token: string, testId: number, questionIds: number[]): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.post(`/api/admin/mocktests/${testId}/bulk-add-questions/`, 
        { question_ids: questionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },
  
  deleteMockTest: async (token: string, id: number): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.delete(`/api/admin/mocktests/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  publishMockTest: async (token: string, id: number, isPublished: boolean): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.patch(`/api/admin/mocktests/${id}/`, 
        { is_published: isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  }
};
