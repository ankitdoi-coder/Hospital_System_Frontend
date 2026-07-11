import { createSlice } from '@reduxjs/toolkit';
import { fetchDoctorAppointmentsThunk, updateAppointmentStatusThunk } from '../thunks/appointmentsThunks';

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],          // Will hold action.payload.content
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // 1. Reducer definition
    addAppointment: (state, action) => {
        state.list.push(action.payload);
    },
    setAppointments: (state, action) => {
        state.list = action.payload;
    },
    setLoading: (state, action) => {
        state.loading = action.payload;
    },
    updateAppointment: (state, action) => {
        const updatedAppt = action.payload;
        state.list = state.list.map((appt) =>
            appt.id === updatedAppt.id ? updatedAppt : appt
        );
    },
    setPatients: (state, action) => {
        state.patients = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointments
      .addCase(fetchDoctorAppointmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content; 
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchDoctorAppointmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Status Success
      .addCase(updateAppointmentStatusThunk.fulfilled, (state, action) => {
        const updatedAppt = action.payload;
        state.list = state.list.map((appt) =>
          appt.id === updatedAppt.id ? updatedAppt : appt
        );
      });
  },
});

// 2. YEH LINE SABSE ZAROORI HAI: Yahan se actions export karo
export const { addAppointment, setAppointments, setLoading, updateAppointment, setPatients } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;