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
        updateAdminIdAndUsername: (state, action: PayloadAction<AdminDataInterface>) => {
            state.admin_id= action.payload.admin_id
            state.admin_username= action.payload.admin_username
        }
    }
})

export default adminDataSlice.reducer;
export const {updateAdminIdAndUsername} = adminDataSlice.actions;