import type { DashboardStats, ApiResponse } from '@/types';

// Helper for making API calls
// Beradaptasi secara relatif terhadap hostname Frontend
const API_URL = '/api';

const authHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    // Determine content type based on whether body is FormData
    const isFormData = (options.body && options.body instanceof FormData);

    const headers = new Headers({
        ...authHeader(),
    });

    // Only add basic JSON Application Content-Type if it's NOT a File Upload FormData
    // (if FormData, the browser automatically establishes the correct multipart/form-data with boundaries)
    if (!isFormData) {
        headers.set('Content-Type', 'application/json');
    }

    if (options.headers) {
        const customHeaders = new Headers(options.headers);
        customHeaders.forEach((value, key) => headers.set(key, value));
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
    return response.json();
};

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
    return fetchApi('/dashboard-stats');
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export const getUsers = async (): Promise<ApiResponse<any[]>> => fetchApi('/users');
export const createUser = async (data: any): Promise<ApiResponse<any>> => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = async (id: string, data: any): Promise<ApiResponse<any>> => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = async (id: string): Promise<ApiResponse<null>> => fetchApi(`/users/${id}`, { method: 'DELETE' });

export const getAcademicDocuments = async (): Promise<any> => fetchApi('/academic-documents');
export const createAcademicDocument = async (v: any): Promise<any> => fetchApi('/academic-documents', { method: 'POST', body: JSON.stringify(v) });
export const updateAcademicDocument = async (id: any, v: any): Promise<any> => fetchApi(`/academic-documents/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deleteAcademicDocument = async (id: any): Promise<any> => fetchApi(`/academic-documents/${id}`, { method: 'DELETE' });

export const getExtracurriculars = async (v?: any): Promise<any> => {
    return fetchApi(`/extracurriculars?page=${v?.page || 1}&limit=${v?.limit || 10}&sortBy=${v?.sortBy || 'createdAt'}&sortOrder=${v?.sortOrder || 'desc'}`);
};
export const createExtracurricular = async (v: any): Promise<any> => fetchApi('/extracurriculars', { method: 'POST', body: JSON.stringify(v) });
export const updateExtracurricular = async (id: any, v: any): Promise<any> => fetchApi(`/extracurriculars/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deleteExtracurricular = async (id: any): Promise<any> => fetchApi(`/extracurriculars/${id}`, { method: 'DELETE' });

export const getFacilities = async (): Promise<any> => fetchApi('/facilities');
export const createFacility = async (v: any): Promise<any> => fetchApi('/facilities', { method: 'POST', body: JSON.stringify(v) });
export const updateFacility = async (id: any, v: any): Promise<any> => fetchApi(`/facilities/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deleteFacility = async (id: any): Promise<any> => fetchApi(`/facilities/${id}`, { method: 'DELETE' });

export const getGraduations = async (v: any, v2?: any): Promise<any> => {
    let url = `/graduations?page=${v?.page || 1}&limit=${v?.limit || 10}&sortBy=${v?.sortBy || 'createdAt'}&sortOrder=${v?.sortOrder || 'desc'}`;
    if (v2) url += `&searchNisn=${v2}`;
    return fetchApi(url);
};
export const createGraduation = async (v: any): Promise<any> => fetchApi('/graduations', { method: 'POST', body: JSON.stringify(v) });
export const updateGraduation = async (id: any, v: any): Promise<any> => fetchApi(`/graduations/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deleteGraduation = async (id: any): Promise<any> => fetchApi(`/graduations/${id}`, { method: 'DELETE' });

export const getEducationPersonnel = async (): Promise<any> => fetchApi('/education-personnel');
export const createEducationPersonnel = async (v: any): Promise<any> => fetchApi('/education-personnel', { method: 'POST', body: JSON.stringify(v) });
export const updateEducationPersonnel = async (id: any, v: any): Promise<any> => fetchApi(`/education-personnel/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deleteEducationPersonnel = async (id: any): Promise<any> => fetchApi(`/education-personnel/${id}`, { method: 'DELETE' });

export const getPosts = async (v?: any): Promise<any> => {
    return fetchApi(`/posts?page=${v?.page || 1}&limit=${v?.limit || 10}&sortBy=${v?.sortBy || 'createdAt'}&sortOrder=${v?.sortOrder || 'desc'}`);
};
export const createPost = async (v: any): Promise<any> => fetchApi('/posts', { method: 'POST', body: JSON.stringify(v) });
export const updatePost = async (id: any, v: any): Promise<any> => fetchApi(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(v) });
export const deletePost = async (id: any): Promise<any> => fetchApi(`/posts/${id}`, { method: 'DELETE' });

// Auth
export const login = async (data: any): Promise<any> => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) });
