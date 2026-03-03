import {  createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllUsersReduxStoreInterface , AllUsersApiResponse} from "@/app/schemas/userSchemas";
import { setLoadingState } from "./matchData";

const initialState : AllUsersReduxStoreInterface = {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    data: [],
    isLoading: false,
    hasReachedEnd: false,
}

const allUsersDataSlice= createSlice({
    name: "allUsersData",
    initialState,
    reducers: {
        updateAllUsersData: (state, action: PayloadAction<AllUsersApiResponse>) => {
            state.page= action.payload.page
            state.limit= action.payload.limit
            state.total= action.payload.total
            state.total_pages= action.payload.total_pages
            state.has_next_page= action.payload.has_next_page
            state.data= action.payload.users_data
        },
        appendUsersData: (state, action: PayloadAction<AllUsersApiResponse>)=> {
            state.has_next_page= action.payload.has_next_page
            state.page= action.payload.page
            state.isLoading= false
            state.data= [...state.data, ...action.payload.users_data]
        },
        setUserDataLoadingState: (state)=> {
            state.isLoading= !state.isLoading
        }
    }
})


export default allUsersDataSlice.reducer;
export const {
    updateAllUsersData,
    appendUsersData,
    setUserDataLoadingState
} = allUsersDataSlice.actions;