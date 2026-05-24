import {configureStore} from "@reduxjs/toolkit";
import authSliceReducers from "./authSlice";

const stores=configureStore({
    reducer:{
        authSlice:authSliceReducers,
    },
});

export default stores;