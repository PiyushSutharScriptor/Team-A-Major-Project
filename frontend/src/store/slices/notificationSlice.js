import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (page = 1, thunkAPI) => {
  try {
    const response = await api.get(`/notifications?page=${page}&limit=20`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, thunkAPI) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update notification');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, thunkAPI) => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update notifications');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    total: 0,
    page: 1,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.items = action.payload.notifications;
        } else {
          // Append for infinite scroll (if implemented)
          state.items = [...state.items, ...action.payload.notifications];
        }
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find(n => n._id === action.payload.notification._id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
