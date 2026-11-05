import type {
  MezmurListItem,
  MezmurDetail,
  MezmurRequest,
  CreateMezmurPayload,
  PendingMezmur,
  AdminMezmurItem,
} from '../types';

const BASE_URL = 'http://localhost:4000/api';
const ADMIN_TOKEN_KEY = 'begenarxiv_admin_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch {}
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
  },
};

function getAuthHeaders(): Record<string, string> {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      authStorage.removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('begenarxiv:auth-expired'));
      }
    }
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error || `API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Authentication
  loginAdmin: (password: string) =>
    fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then((res) =>
      handleResponse<{
        success: boolean;
        token: string;
        message: string;
      }>(res)
    ),

  verifyAdmin: () =>
    fetch(`${BASE_URL}/admin/verify`, {
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<{ success: boolean; valid: boolean }>(res)),

  logoutAdmin: async () => {
    try {
      await fetch(`${BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
    } catch {
      // Ignore network failure on logout
    } finally {
      authStorage.removeToken();
    }
  },

  // Catalogue
  getMezmurs: () =>
    fetch(`${BASE_URL}/mezmurs`).then((res) => handleResponse<MezmurListItem[]>(res)),

  getMezmurById: (id: string, admin = false) =>
    fetch(`${BASE_URL}/mezmurs/${id}${admin ? '?admin=true' : ''}`, {
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<MezmurDetail>(res)),

  createMezmur: (payload: CreateMezmurPayload) =>
    fetch(`${BASE_URL}/mezmurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }).then((res) =>
      handleResponse<{
        success: boolean;
        mezmurId: number;
        title: string;
        message?: string;
        status?: string;
      }>(res)
    ),

  // Community Submission review (Admin)
  getPendingMezmurs: () =>
    fetch(`${BASE_URL}/mezmurs/pending`, {
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<PendingMezmur[]>(res)),

  approveMezmur: (id: number) =>
    fetch(`${BASE_URL}/mezmurs/${id}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<{ success: boolean; message: string }>(res)),

  rejectMezmur: (id: number, reason?: string) =>
    fetch(`${BASE_URL}/mezmurs/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ reason }),
    }).then((res) => handleResponse<{ success: boolean; message: string }>(res)),

  getAllMezmursAdmin: () =>
    fetch(`${BASE_URL}/mezmurs/admin/all`, {
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<AdminMezmurItem[]>(res)),

  deleteMezmur: (id: number) =>
    fetch(`${BASE_URL}/mezmurs/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    }).then((res) => handleResponse<{ success: boolean; message: string; id: number }>(res)),

  updateMezmur: (id: number, payload: Partial<CreateMezmurPayload>) =>
    fetch(`${BASE_URL}/mezmurs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }).then((res) =>
      handleResponse<{ success: boolean; message: string; mezmurId: number }>(res)
    ),

  getArtists: () =>
    fetch(`${BASE_URL}/artists`).then((res) =>
      handleResponse<{ id: number; name: string; mezmur_count?: number }[]>(res)
    ),

  createArtist: (name: string) =>
    fetch(`${BASE_URL}/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then((res) => handleResponse<{ id: number; name: string }>(res)),

  getTunes: () =>
    fetch(`${BASE_URL}/tunes`).then((res) => handleResponse<{ id: number; name: string }[]>(res)),

  getMezmursByArtist: (artistId: number, excludeId: number) =>
    fetch(`${BASE_URL}/artists/${artistId}/mezmurs?exclude=${excludeId}`).then((res) =>
      handleResponse<MezmurListItem[]>(res)
    ),

  getMezmursByTune: (tuneId: number, excludeId: number) =>
    fetch(`${BASE_URL}/tunes/${tuneId}/mezmurs?exclude=${excludeId}`).then((res) =>
      handleResponse<MezmurListItem[]>(res)
    ),

  // Requests API
  getRequests: () =>
    fetch(`${BASE_URL}/requests`).then((res) => handleResponse<MezmurRequest[]>(res)),

  createRequest: (data: {
    title: string;
    artist?: string;
    youtube_url?: string;
    notes?: string;
    requester_name?: string;
    requester_email?: string;
  }) =>
    fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<{ success: boolean; request: MezmurRequest }>(res)),

  updateRequestStatus: (id: number, status: 'pending' | 'in_progress' | 'completed') =>
    fetch(`${BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<{ success: boolean; request: MezmurRequest }>(res)),
};
