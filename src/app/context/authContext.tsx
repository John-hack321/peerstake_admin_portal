import { ReactNode, useEffect, useState } from "react"
import axios from "axios"
import { createContext } from "react"
import { useContext } from "react"

import { refreshAccessToken } from "../api/auth"
import { AdminDataInterface } from "../appState/slices/adminData"
import { useRouter } from "next/navigation"

// redux imports
import { RootState } from "../appState/store"
import { AppDispatch } from "../appState/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateAdminIdAndUsername } from "../appState/slices/adminData"

export type AuthProviderProps = {
    children: ReactNode // ReactNode is a type for children components in react
}

type AuthContextType = { // here we get o define what data or function the auth context will share across our application 
  admin: AdminDataInterface | null | undefined ; // we have to add undefined in regard to the loading state 
  login: ( username : string , password: string) => Promise<void>;
  logout: () => void;
  loading : boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined); // the create context is used to create a context to share data accross our app ie. the logged in user 
// th

export const AuthProvider = ({children}: AuthProviderProps) => {

    const [loading, setLoading]= useState<boolean>(true)
    const [admin, setAdmin]= useState<AdminDataInterface | null | undefined>(undefined)
    const router= useRouter()

    // redux functionalities
    const adminData= useSelector((state: RootState)=> state.adminData)
    const dispatch= useDispatch<AppDispatch>()

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
                setLoading(false)
            }
        };

        checkAuthStatus();
    },[])

    useEffect(()=> { // NOTE: this one might not be that necesary it will depend on whether we need the 
        {/*
          * this one runs everytime we are unable to have access to the ui due to our access token being expire , 
          * it catches the error 401 errors and sends the refresh token for a new access token
           */}
        // Response interceptor - catches 401 errors
        const interceptor = axios.interceptors.response.use(
        (response) => response, // Pass through successful responses
        async (error) => {
        const originalRequest = error.config;
    
          // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark that we've tried
    
            try {
              // Try to refresh the token
                const newAccessToken = await refreshAccessToken();

              // Retry the original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed - user needs to login again
                return Promise.reject(refreshError);
            }
        }
    
            return Promise.reject(error);
        }
    );
    
    return () => {
        axios.interceptors.response.eject(interceptor);
    };
    },[])

    const login = async (username: string, password: string) => {
        try {
            console.log(`the login function has been fired with username as : ${username} and password as ${password}`)
            const formData = new FormData();
            formData.append('password', password);
            formData.append('username', username);
            
            console.log("Sending login request with username and password");
            const response = await axios.post('http://localhost:8000/auth/token', formData, { // we will need ot change this endpoint and also use the in system set varialbe the next js style
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            });
    
            console.log(`the backeng login function has been reaches and it has returned the following login data`, response.data)
    
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            
            // Set the token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            console.log(`the access token has been set to axio headers successfuly`)
            
            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Decode the token to get the admins information / data
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
    
          // Create user data with proper typing
            const adminData: AdminDataInterface = {
            admin_id: parseFloat(payload.id),
            admin_username: String(payload.sub),
            };
            
          // Update user state
            setAdmin(adminData);
            console.log(`the user in local storage has been set to user gottne from the api `)
            
          // Update Redux store with user data
            dispatch(updateAdminIdAndUsername(adminData));
            console.log(`the redux store has now been updated with the data too`)
            
            // Redirect to home page after successful login
            router.push('/main');
            console.log('now pushing the user to the home page hopefuly')
          // return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
            }
    };
    
    const logout = async () => {
        try {
            // Call backend logout endpoint
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
            /* for now there still no need of doing the api call to the backend
            await axios.post('http://localhost:8000/auth/logout', null, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
            });
            */
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
          
        } finally {
          // Clear everything
          setAdmin(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete axios.defaults.headers.common['Authorization'];
          router.push('/login');
        }
      }

      return ( // and now this is the component that we now return which houses all of the login and logout logic and goes foward to share it across all of the components 
        <AuthContext.Provider value={{ admin, login, logout , loading }}>
          {children}
        </AuthContext.Provider>
      );

}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;