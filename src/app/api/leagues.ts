import axios, { AxiosError } from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { GeneralPostResponseModel } from '../schemas/general';
import { ApiError } from './api_utils';
import { AllLeaguesApiResponse } from '../appState/slices/leaguesData';
 
// ─── Helper: get the access token or throw immediately ───────────────────────
// Centralises the "no token → throw 401" guard that was previously done
// differently (or incorrectly) in every function.
 
const getAccessToken = (): string => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new ApiError(401, 'You are not logged in. Please log in and try again.');
    }
    return token;
};
 
// ─── Get all leagues ──────────────────────────────────────────────────────────
 
export const getLeaguesList = async (
    limit: number = 100,
    page: number = 1
): Promise<AllLeaguesApiResponse> => {
    const accessToken = getAccessToken();
 
    try {
        const response = await axios.get(
            `${API_BASE_URL}/admin/leagues/admin_get_all_leagues`,
            {
                params: { limit, page },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );
 
        return response.data;
 
    } catch (error) {
        if (error instanceof ApiError) throw error; // re-throw our own errors (e.g. from getAccessToken)
 
        if (error instanceof AxiosError && error.response) {
            const status = error.response.status;
            if (status === 401) throw new ApiError(401, 'Your session expired. Please log in again.');
            if (status === 403) throw new ApiError(403, "You don't have permission to do this.");
            if (status === 404) throw new ApiError(404, 'No leagues were found in the database.');
            if (status === 422) throw new ApiError(422, 'Invalid request. Please refresh and try again.');
            if (status >= 500) throw new ApiError(status, 'A server error occurred. Please try again later.');
        }
 
        throw new ApiError(0, 'Could not reach the server. Check your connection.');
    }
};
 
// ─── Add fixtures to a league ─────────────────────────────────────────────────
// Placeholder — wire up when the backend endpoint is ready.
 
export interface MatchPayload {
    home_team: string;
    away_team: string;
    match_date: string; // ISO string, e.g. "2025-06-15T15:00:00"
}
 
export const addFixturesToLeague = async (
    leagueId: number,
    matches: MatchPayload[]
): Promise<GeneralPostResponseModel> => {
    const accessToken = getAccessToken();
 
    try {
        const response = await axios.post(
            `${API_BASE_URL}/admin/leagues/${leagueId}/add_fixtures`,
            { matches },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );
 
        return response.data;
 
    } catch (error) {
        if (error instanceof ApiError) throw error;
 
        if (error instanceof AxiosError && error.response) {
            const status = error.response.status;
            if (status === 401) throw new ApiError(401, 'Your session expired. Please log in again.');
            if (status === 403) throw new ApiError(403, "You don't have permission to do this.");
            if (status === 404) throw new ApiError(404, `League #${leagueId} was not found.`);
            if (status === 422) throw new ApiError(422, 'Invalid request. Please refresh and try again.');
            if (status >= 500) throw new ApiError(status, 'A server error occurred. Please try again later.');
        }
 
        throw new ApiError(0, 'Could not reach the server. Check your connection.');
    }
};
 