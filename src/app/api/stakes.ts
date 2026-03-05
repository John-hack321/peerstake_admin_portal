import axios, { AxiosError } from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { ApiError } from './api_utils';
import { UserStakeData } from '../components/tabs/userSubTabs/allUsers';


export interface UserStakeDataResponse {
    status_code: string;
    message: string;
    stakeData: UserStakeData[]
}

export const adminGetAllUserStakes= async (user_id: number): Promise<UserStakeDataResponse> => {

    const accessToken= localStorage.getItem('accessToken')
    if (!accessToken) console.error('access token not found in localStorage')

    try {
        const response = await axios.get(`${API_BASE_URL}/admin/stakes/all_user_stakes/`, {
            params: { user_id: user_id },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
            });

        return response.data

    } catch (error) {
         // AxiosError = the server responded with a non-2xx status code
    if (error instanceof AxiosError && error.response) {
        const status = error.response.status

      // Each code maps to a message the user can actually understand
        if (status === 401) throw new ApiError(401, "Your session expired. Please log in again.")
        if (status === 403) throw new ApiError(403, "You don't have permission to do this.")
        if (status === 404) throw new ApiError(404, `stakes for user ${user_id} were not found.`)
        if (status === 422) throw new ApiError(422, "Invalid request. Please refresh and try again.")
        if (status >= 500) throw new ApiError(status, "A server error occurred. Please try again later.")
    }

    // No response at all = network error (no internet, backend is down, etc.)

    throw new ApiError(0, "Could not reach the server. Check your connection.")

    }
}