import axios, {  AxiosError } from 'axios';
import { AllUsersApiResponse } from '../schemas/userSchemas';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { ApiError } from './api_utils';


export const fetchAllUsersData = async (limit: number= 100, page: number= 1): Promise<AllUsersApiResponse> => {

    const accessToken= localStorage.getItem('accessToken')
    if (!accessToken) {
        throw new ApiError(401, "you are not logged in please log in and try again")
    }

    try {   
        const response= await axios.get(`${API_BASE_URL}/admin/users/get_all_users`, {
            params: { limit, page },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        console.log(`user data has been returned from the api and is as : `, response.data)

        return response.data;

    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const status= error.response.status

            // Each code maps to a message the user can actually understand
            if (status === 401) throw new ApiError(401, "Your session expired. Please log in again.")
            if (status === 403) throw new ApiError(403, "You don't have permission to do this.")
            if (status === 404) throw new ApiError(404, `user were not found in the system.`)
            if (status === 422) throw new ApiError(422, "Invalid request. Please refresh and try again.")
            if (status >= 500) throw new ApiError(status, "A server error occurred. Please try again later.")
        }

    throw new ApiError(0, "Could not reach the server. Check your connection.")

    }
}