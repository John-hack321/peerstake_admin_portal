import axios, { AxiosError } from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { AllFixturesApiResponse } from '../schemas/match_schemas';
import { GeneralPostResponseModel } from '../schemas/general';
import { ApiError } from './api_utils';

// ─── Get all fixtures ─────────────────────────────────────────────────────────
// (unchanged — returning null here is fine since it's a background load)

export const get_all_fixtures_from_backend = async (
    limit: number = 100,
    page: number = 1
): Promise<AllFixturesApiResponse | null> => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      console.error('access token not found in localStorage')
    }

    const response = await axios.get(`${API_BASE_URL}/fixtures/`, {
      params: { limit, page },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data

  } catch (error) {
    console.error('error fetching fixtures:', error)
    return null
  }
}


// ─── Make match live ──────────────────────────────────────────────────────────
//
// BEFORE: caught everything, returned null → caller had no idea what went wrong
//
// AFTER:  throws ApiError with the real status code + a user-friendly message.
//         The component catches it and can show the right message to the user.
//         Return type is no longer `| null` — either it succeeds or it throws.

export const makeMatchLiveAndReadyForLogging = async (
  matchId: number
): Promise<GeneralPostResponseModel> => {

  const accessToken = localStorage.getItem('accessToken')

  // Catch missing token BEFORE the request — no point hitting the server
    if (!accessToken) {
    throw new ApiError(401, "You are not logged in. Please log in and try again.")
    }

    try {
    const response = await axios.post(
        `${API_BASE_URL}/admin/fixtures/make_match_live_and_start_logging`,
        null,
        {
        params: { match_id: matchId },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
        }
    )

    return response.data

  } catch (error) {

    // AxiosError = the server responded with a non-2xx status code
    if (error instanceof AxiosError && error.response) {
        const status = error.response.status

      // Each code maps to a message the user can actually understand
        if (status === 401) throw new ApiError(401, "Your session expired. Please log in again.")
        if (status === 403) throw new ApiError(403, "You don't have permission to do this.")
        if (status === 404) throw new ApiError(404, `Match #${matchId} was not found.`)
        if (status === 422) throw new ApiError(422, "Invalid request. Please refresh and try again.")
        if (status >= 500) throw new ApiError(status, "A server error occurred. Please try again later.")
    }

    // No response at all = network error (no internet, backend is down, etc.)
    throw new ApiError(0, "Could not reach the server. Check your connection.")
  }
}


export const log_live_match_scores = async (
  matchId: number ,
  homeScore: number,
  awayScore: number): Promise<GeneralPostResponseModel> => {
  
  const accessToken= localStorage.getItem("accessToken")
    if (!accessToken) {
      console.error("access token was not found in the local storage")
    }

  try {

    const score_string: string= `${homeScore} - ${awayScore}`
    const match_id: number= matchId


    const response= await axios.post(
      `${API_BASE_URL}/admin/fixtures/log_live_match_scores`, null, {
        params: {match_id, score_string},
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    return response.data;

  } catch (error) {

    // AxiosError = the server responded with a non-2xx status code
    if (error instanceof AxiosError && error.response) {
        const status = error.response.status

        if (status === 401) throw new ApiError(401, "Your session expired. Please log in again.")
        if (status === 403) throw new ApiError(403, "You don't have permission to do this.")
        if (status === 404) throw new ApiError(404, `Match #${matchId} was not found.`)
        if (status === 422) throw new ApiError(422, "Invalid request. Please refresh and try again.")
        if (status >= 500) throw new ApiError(status, "A server error occurred. Please try again later.")
    }

    // No response at all = network error (no internet, backend is down, etc.)
    throw new ApiError(0, "Could not reach the server. Check your connection.")
  }
}