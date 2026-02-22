import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
import { AllFixturesApiResponse } from '../schemas/match_schemas';
import { access } from 'fs';
import { GeneralPostResponseModel } from '../schemas/general';

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

export const  makeMatchLiveAndReadyForLogging= async (matchId: number): Promise <GeneralPostResponseModel | null > => {
    try{
        const accessToken= localStorage.getItem('accessToken')
        if (!accessToken) {
            console.error(` access token was not found in the local storage`)
        }

        const match_id = matchId

        const response = await axios.post(`${API_BASE_URL}/admin/fixtures/make_match_live_and_start_logging`, match_id , {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        return response.data;

    } catch (error) {
        console.error(`an error occured while doing the make match live api call for match_id : ${matchId}`, error)
        return null
    }finally {
        // still figuring this part out
    }
}