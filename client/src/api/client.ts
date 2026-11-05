import type {
  MezmurListItem,
  MezmurDetail,
  MezmurRequest,
  CreateMezmurPayload,
  PendingMezmur,
  AdminMezmurItem,
} from '../types';

const BASE_URL = 'http://localhost:4000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error || `API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getMezmurs: () =>
    fetch(`${BASE_URL}/mezmurs`).then((res) => handleResponse<MezmurListItem[]>(res)),

  getMezmurById: (id: string) =>
    fetch(`${BASE_URL}/mezmurs/${id}`).then((res) => handleResponse<MezmurDetail>(res)),

  createMezmur: (payload: CreateMezmurPayload) =>
    fetch(`${BASE_URL}/mezmurs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    fetch(`${BASE_URL}/mezmurs/pending`).then((res) => handleResponse<PendingMezmur[]>(res)),

  approveMezmur: (id: number) =>
    fetch(`${BASE_URL}/mezmurs/${id}/approve`, {
      method: 'POST',
    }).then((res) => handleResponse<{ success: boolean; message: string }>(res)),

  rejectMezmur: (id: number) =>
    fetch(`${BASE_URL}/mezmurs/${id}/reject`, {
      method: 'POST',
    }).then((res) => handleResponse<{ success: boolean; message: string }>(res)),

  getAllMezmursAdmin: () =>
    fetch(`${BASE_URL}/mezmurs/admin/all`).then((res) => handleResponse<AdminMezmurItem[]>(res)),

  deleteMezmur: (id: number) =>
    fetch(`${BASE_URL}/mezmurs/${id}`, {
      method: 'DELETE',
    }).then((res) => handleResponse<{ success: boolean; message: string; id: number }>(res)),

  updateMezmur: (id: number, payload: Partial<CreateMezmurPayload>) =>
    fetch(`${BASE_URL}/mezmurs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) =>
      handleResponse<{ success: boolean; message: string; mezmurId: number }>(res)
    ),

  getArtists: () =>
    fetch(`${BASE_URL}/artists`).then((res) => handleResponse<{ id: number; name: string }[]>(res)),

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<{ success: boolean; request: MezmurRequest }>(res)),
};
