import axios, { AxiosError } from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { GeneralPostResponseModel } from '../schemas/general';
import { ApiError } from './api_utils';
import { AllLeaguesApiResponse } from '../appState/slices/leaguesData';

export interface ApikeyConfirmtation {
    accessTokenString : string | null;
    confirmation: boolean;
}

export const confirmApiKey = async () : Promise<ApikeyConfirmtation> => {
    try {
        const accessToken= await localStorage.getItem("accessToken")
        if (!accessToken) {
            const returnData: ApikeyConfirmtation = {
                accessTokenString : null,
                confirmation: false,
            }

            return returnData
        }

        const returnData: ApikeyConfirmtation = {
            accessTokenString : accessToken,
            confirmation: false,
        }

        return returnData
    }
    catch (error) {
        console.error('failed to confime api key', error)
        throw new Error (`there was an error accessing the api key`)
    }
}

// find a solution for the undefined type return issues


export const getLeaguesList = async (limit: number = 100, page: number = 1): Promise<AllLeaguesApiResponse> => {
    try {
        const ApiKeyData : ApikeyConfirmtation = await  confirmApiKey()
        if (ApiKeyData.accessTokenString) {
            console.error(`an error occured while fetching api key from the local storage`)
        }
        const accessToken= ApiKeyData.accessTokenString
    
        const response = await axios.get(`${API_BASE_URL}/admin/leagues/admin_get_all_leagues`, {
            params: { limit, page },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
            });
    
            return response.data;
    } catch (error) {

        // AxiosError = the server responded with a non-2xx status code
        if (error instanceof AxiosError && error.response) {
            const status = error.response.status

        // Each code maps to a message the user can actually understand
            if (status === 401) throw new ApiError(401, "Your session expired. Please log in again.")
            if (status === 403) throw new ApiError(403, "You don't have permission to do this.")
            if (status === 404) throw new ApiError(404, `No leagues were found i the database.`)
            if (status === 422) throw new ApiError(422, "Invalid request. Please refresh and try again.")
            if (status >= 500) throw new ApiError(status, "A server error occurred. Please try again later.")
        }

        // No response at all = network error (no internet, backend is down, etc.)
        throw new ApiError(0, "Could not reach the server. Check your connection.")

    }
}

// NOTE: look into the comfirm api method and make more improvements in the future.
// NOTE: do the change to make the code to be specific to the league stuff as this is copied from matches api file