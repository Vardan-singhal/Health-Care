import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import doctorsReducer from "../features/doctorsSlice";
import appointmentsReducer from "../features/appointmentsSlice";
import messagesReducer from "../features/messagesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    messages: messagesReducer,
  },
});

export default store;
