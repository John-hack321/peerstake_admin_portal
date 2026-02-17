import { ReactNode, useEffect, useState } from "react"
import axios from "axios"
import { AdminDataInterface } from "../appState/slices/adminData"

export type AuthProviderProps = {
    children: ReactNode // ReactNode is a type for children components in react
}

export const AuthProvider = ({children}: AuthProviderProps) => {

    const [isLoading, setIsLoading]= useState<boolean>()
    const [admin, setAdmin]= useState<AdminDataInterface>()

    // on loading the first thing we do is to check the auth status: 
    useEffect(()=> {
        const checkAuthStatus = async () => {
            try {
                const accessToken= localStorage.getItem('accessToken')
                if (accessToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    const payload = JSON.parse(atob(accessToken.split('.')[1])); // we then decode the jwt to get the data we want : username and id 
                
                                     // Check if token is expired
                    if (payload.exp * 1000 > Date.now()) { // er first check if the token is expired 
                        setAdmin({
                            admin_id: payload.id,
                            admin_username: payload.sub,
                        });
                    }
                    else {
                        localStorage.removeItem('accessToken');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                }

            }catch (error) {
                console.error('Error checking auth status:', error);
                // Clear invalid token
                localStorage.removeItem('accessToken');
                delete axios.defaults.headers.common['Authorization'];
            }finally {
                setIsLoading(false)
            }
        };

        checkAuthStatus();
    },[])
}