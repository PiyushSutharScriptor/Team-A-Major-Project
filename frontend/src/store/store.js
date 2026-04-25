import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issueReducer from './slices/issueSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issueReducer,
    notifications: notificationReducer,
  },
});
