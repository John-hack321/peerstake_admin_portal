import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface League{
    local_id: number;
    localized_name: string;
    fixture_added: boolean;
    updated_at?: string;
    id: number;
    name: string;
    logo_url: string;
    created_at? : string;
}

export interface AllLeaguesApiResponse {
    page : number;
    limit : number;
    total : number;
    total_page : number;
    has_next_page : boolean;
    data : League[];
}

export interface AllLeaguesReduxStoreInterface {
    currentLeague: number | null;
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    data: League[];
    isLoading: boolean;
    hasReachedEnd: boolean;
}

const initialState : AllLeaguesReduxStoreInterface = {
    currentLeague: null,
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: true,
    data: [],
    isLoading: false,
    hasReachedEnd: false,
}

const allLeaguesDataSlice= createSlice({
    name: "allLeaguesData",
    initialState,
    reducers: {
        updateAllLeaguesData: (state , action: PayloadAction<AllLeaguesApiResponse>) => {
            state.page= action.payload.page
            state.limit= action.payload.limit
            state.total= action.payload.total
            state.total_pages= action.payload.total_page
            state.has_next_page= action.payload.has_next_page
            state.data= action.payload.data
        },
        appendLeaguesData: (state, action : PayloadAction<AllLeaguesApiResponse>) => {
            state.page= action.payload.page
            state.has_next_page= action.payload.has_next_page
            state.isLoading= false
            state.data= [...state.data, ...action.payload.data]

        },
        setLeaguesLoadingState: (state)=> {
            state.isLoading= !state.isLoading
        },
        updateCurrentLeague: (state, action: PayloadAction<{leagueId: number}> )=> { // for updating the current league
            state.currentLeague= action.payload.leagueId
        },
        resetCurrentLeagueToNull: (state)=> {
            state.currentLeague = null;
        }
    }
})

export default allLeaguesDataSlice.reducer;
export const {
    updateAllLeaguesData,
    appendLeaguesData,
    setLeaguesLoadingState,
    updateCurrentLeague,
    resetCurrentLeagueToNull
} = allLeaguesDataSlice.actions