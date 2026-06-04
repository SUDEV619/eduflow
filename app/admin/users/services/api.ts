import apiClient from '@/lib/apiClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  date_joined: string;
}

export interface PaginationData {
  page: number;
  total_pages: number;
  count: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: PaginationData;
  message?: string;
}

const handleError = (error: any) => {
  let errorMessage = 'An error occurred';
  if (error.response?.data?.message) {
    const data = error.response.data;
    if (typeof data.message === 'object') {
      errorMessage = Object.entries(data.message)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
    } else {
      errorMessage = data.message;
    }
  } else if (!error.response && error.message === 'Network Error') {
      errorMessage = 'Connection error. Please ensure the backend server is running.';
  }
  throw new Error(errorMessage);
};

export const adminApi = {
  getUsers: async (token: string, search = '', status = '', page = 1): Promise<ApiResponse<User[]>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      params.append('page', String(page));

      const res = await apiClient.get(`/api/admin/users/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  getUserDetails: async (token: string, id: number): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.get(`/api/admin/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  updateUserStatus: async (token: string, id: number, isActive: boolean): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.patch(`/api/admin/users/${id}/status/`, 
        { is_active: isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },

  deleteUser: async (token: string, id: number): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.delete(`/api/admin/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (e) {
      handleError(e);
      throw e;
    }
  },
};

