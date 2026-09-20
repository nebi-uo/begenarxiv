const BASE_URL = 'http://localhost:4000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getMezmurs: () =>
    fetch(`${BASE_URL}/mezmurs`).then((res) => handleResponse<import('../types').MezmurListItem[]>(res)),

  getMezmurById: (id: string) =>
    fetch(`${BASE_URL}/mezmurs/${id}`).then((res) => handleResponse<import('../types').MezmurDetail>(res)),

  getArtists: () =>
    fetch(`${BASE_URL}/artists`).then((res) => handleResponse<{ id: number; name: string }[]>(res)),

  getTunes: () =>
    fetch(`${BASE_URL}/tunes`).then((res) => handleResponse<{ id: number; name: string }[]>(res)),
  getMezmursByArtist: (artistId: number, excludeId: number) =>
    fetch(`${BASE_URL}/artists/${artistId}/mezmurs?exclude=${excludeId}`).then((res) =>
      handleResponse<import('../types').MezmurListItem[]>(res)
    ),

  getMezmursByTune: (tuneId: number, excludeId: number) =>
    fetch(`${BASE_URL}/tunes/${tuneId}/mezmurs?exclude=${excludeId}`).then((res) =>
      handleResponse<import('../types').MezmurListItem[]>(res)
    ),
};