import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';


export const refreshAccessToken= async () /* Promise<RefreshTokenResponse> */ => {
    try {

        const refreshToken= localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
            console.error(`an error occured: refresh token not found in localStorage`)
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/admin/auth/token/refresh`, null, { // change the url to match the admin endpoint for refresh tokens/ tokens in general
            headers: {
            'Authorization': `Bearer ${refreshToken}`
            }
        });

        const newAccessToken= response.data.access_token

        localStorage.setItem('accessToken', newAccessToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        return newAccessToken

    } catch (error) {

        console.error('an error occured while sendind refresh token request', error)
        //logout() // if the authoraizatoin falls we log out the user out of the sytem once nad for all
    }
}