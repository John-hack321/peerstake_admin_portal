import {  createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface AdminDataInterface {
    admin_id: number;
    admin_username: string;
}

const initialState : AdminDataInterface = {
    admin_id : 0,
    admin_username : "name",
};

const adminDataSlice= createSlice({
    name: "adminData",
    initialState,
    reducers:{
        updateAdminIdAndUsername: (state, action: PayloadAction<{id: number, username: string}>) => {
            state.admin_id= action.payload.id
            state.admin_username= action.payload.username
        }
    }
})

export default adminDataSlice.reducer;
export const {updateAdminIdAndUsername} = adminDataSlice.actions;