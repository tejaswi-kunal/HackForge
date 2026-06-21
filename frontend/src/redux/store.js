import {configureStore} from "@reduxjs/toolkit";
import authSliceReducers from "./authSlice";
import chatSliceReducers from "./chatSlice";

const stores=configureStore({
    reducer:{
        authSlice:authSliceReducers,
        chatSlice: chatSliceReducers,
    },
});

export default stores;