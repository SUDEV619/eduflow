import apiClient from '@/lib/apiClient';

export interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  subject: string;
  subject_display: string;
  tags: string;
  file: string;
  downloads: number;
  is_favorite: boolean;
  created_at: string;
}

export interface MaterialResponse {
  status: string;
  data: StudyMaterial[];
}

export const studyMaterialApi = {
  getMaterials: async (tab = 'all', subject = 'all', search = '') => {
    const params = new URLSearchParams();
    if (tab) params.append('tab', tab);
    if (subject && subject !== 'all') params.append('subject', subject);
    if (search) params.append('search', search);

    const response = await apiClient.get<MaterialResponse>(`/api/admin/user/materials/?${params.toString()}`);
    return response.data;
  },

  downloadMaterial: async (id: number) => {
    const response = await apiClient.get<{ status: string, file: string }>(`/api/admin/user/materials/${id}/download/`);
    return response.data;
  },

  toggleFavorite: async (id: number) => {
    const response = await apiClient.post<{ status: string, action: string }>(`/api/admin/user/materials/${id}/favorite/`);
    return response.data;
  }
};
