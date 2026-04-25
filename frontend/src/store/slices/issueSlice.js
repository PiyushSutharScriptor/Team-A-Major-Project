import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyIssues = createAsyncThunk('issues/fetchMy', async (_, thunkAPI) => {
  try {
    const response = await api.get('/issues/my');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
  }
});

export const fetchAllIssues = createAsyncThunk('issues/fetchAll', async (query = '', thunkAPI) => {
  try {
    const response = await api.get(`/issues?${query}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
  }
});

export const fetchIssueStats = createAsyncThunk('issues/fetchStats', async (_, thunkAPI) => {
  try {
    const response = await api.get('/issues/stats');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchMapIssues = createAsyncThunk('issues/fetchMap', async (_, thunkAPI) => {
  try {
    const response = await api.get('/issues/map');
    return response.data.geojson;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch map data');
  }
});

const issueSlice = createSlice({
  name: 'issues',
  initialState: {
    issues: [],
    mapData: null,
    stats: null,
    total: 0,
    page: 1,
    pages: 1,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearIssueError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchIssueStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch Map
      .addCase(fetchMapIssues.fulfilled, (state, action) => {
        state.mapData = action.payload;
      })
      // Fetch My/All Issues (shared logic for lists)
      .addMatcher(
        (action) => ['issues/fetchMy/pending', 'issues/fetchAll/pending'].includes(action.type),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => ['issues/fetchMy/fulfilled', 'issues/fetchAll/fulfilled'].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.issues = action.payload.issues;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pages = action.payload.pages;
        }
      )
      .addMatcher(
        (action) => ['issues/fetchMy/rejected', 'issues/fetchAll/rejected'].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearIssueError } = issueSlice.actions;
export default issueSlice.reducer;
