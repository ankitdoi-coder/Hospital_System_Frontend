import { createSlice } from '@reduxjs/toolkit';
import { fetchDoctorsForAdmin, fetchDoctorsForPatients, approveDoctorThunk, rejectDoctorThunk } from '../thunks/doctorsThunks';

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    list: [],
    pendingDoctors: [],
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDoctors: (state, action) => {
      state.list = action.payload;
    },
    setPendingDoctors: (state, action) => {
      state.pendingDoctors = action.payload;
    },
    approveDoctor: (state, action) => {
      const doctorId = action.payload;
      const doctor = state.list.find(doc => doc.id === doctorId);
      if (doctor) {
        doctor.isApproved = true;
      }
    },
    rejectDoctor: (state, action) => {
      const doctorId = action.payload;
      const doctor = state.list.find(doc => doc.id === doctorId);
      if (doctor) {
        doctor.isApproved = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Doctors Handle
      .addCase(fetchDoctorsForAdmin.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctorsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content; // 'content' Spring Boot se aa raha hai
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchDoctorsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Doctors For Patients
      .addCase(fetchDoctorsForPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content;
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
      })

      // Approve Doctor Handle
      .addCase(approveDoctorThunk.fulfilled, (state, action) => {
        const doctorId = action.payload;
        const doctor = state.list.find(doc => doc.id === doctorId);
        if (doctor) doctor.isApproved = true;
      })

      // Reject Doctor Handle
      .addCase(rejectDoctorThunk.fulfilled, (state, action) => {
        const doctorId = action.payload;
        const doctor = state.list.find(doc => doc.id === doctorId);
        if (doctor) doctor.isApproved = false;
      });
  }
});

// Yahan se saare actions export kar diye hain
export const { setDoctors, setPendingDoctors, setLoading, approveDoctor, rejectDoctor } = doctorsSlice.actions;

export default doctorsSlice.reducer;