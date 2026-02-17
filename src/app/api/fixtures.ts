import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { AllFixturesApiResponse } from '../schemas/match_schemas';

export const get_all_fixtures_from_backend= async (limit: number=100, page: number=1): Promise<AllFixturesApiResponse | null> => {
    try {
        const accessToken= localStorage.getItem('accessToken')
        if (!accessToken) {
            console.error(`an error occured: refresh token not found in localStorage`)
        }

        const response = await axios.get(`${API_BASE_URL}/fixtures/`, {
            params: {
                limit,
                page
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const response_data: AllFixturesApiResponse = response.data;
        
        return response_data

    }catch (error) {
        console.error(`an error occured while trying to fetch the fixtures from the backend`, error)
        return null
    }
}