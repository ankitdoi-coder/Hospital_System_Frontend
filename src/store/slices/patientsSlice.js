import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../Services/AdminService';

export const fetchAllPatientsForAdmin = createAsyncThunk(
  'patients/fetchAllAdmin',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await adminService.getPatients(page, size);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState: {
    list: [],
    currentPatient: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    setPatients: (state, action) => {
      state.list = action.payload;
    },
    // Yahan add kiya setLoading
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPatientsForAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPatientsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content; 
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchAllPatientsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Yahan export mein add kiya setLoading
export const { setCurrentPatient, setPatients, setLoading } = patientsSlice.actions;

export default patientsSlice.reducer;