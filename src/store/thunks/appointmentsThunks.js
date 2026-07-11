import { createAsyncThunk } from '@reduxjs/toolkit';
import doctorService from '../../Services/DoctorService';
import patientService from '../../Services/PatientService';

// 1. Get my appointments as a doctor (PAGINATED)
export const fetchDoctorAppointmentsThunk = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await doctorService.getMyAppointments(page, size);
      return data; // Returns Spring Boot Page object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor appointments');
    }
  }
);

// 2. Update appointment status (No pagination needed)
export const updateAppointmentStatusThunk = createAsyncThunk(
  'appointments/updateStatus',
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      const response = await doctorService.updateAppointmentStatus(appointmentId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

// 3. Create appointment as a patient (No pagination needed)
export const createAppointmentThunk = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await patientService.createAppointment(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);