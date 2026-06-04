import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

export interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  subject: string;
  subject_display: string;
  tags: string;
  file: string;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
  download_count: number;
}

export interface MaterialResponse {
  status: string;
  data: StudyMaterial[];
  message?: string;
}

export interface SingleMaterialResponse {
  status: string;
  data: StudyMaterial;
  message?: string;
}

export const materialApi = {
  getMaterials: async (token: string, subject?: string, search?: string) => {
    const params = new URLSearchParams();
    if (subject && subject !== 'all') params.append('subject', subject);
    if (search) params.append('search', search);

    const response = await axios.get<MaterialResponse>(`${API_BASE_URL}/materials/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  uploadMaterial: async (token: string, formData: FormData) => {
    const response = await axios.post<SingleMaterialResponse>(`${API_BASE_URL}/materials/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateMaterial: async (token: string, id: number, formData: FormData) => {
    const response = await axios.put<SingleMaterialResponse>(`${API_BASE_URL}/materials/${id}/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteMaterial: async (token: string, id: number) => {
    const response = await axios.delete<{ status: string; message: string }>(`${API_BASE_URL}/materials/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
