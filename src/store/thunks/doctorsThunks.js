import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDoctors as getPatientDoctors } from '../../Services/PatientService';
import { getDoctors, approveDoctor, rejectDoctor } from '../../Services/AdminService';

// 1. Fetch Doctors for Patients (Paginated)
export const fetchDoctorsForPatients = createAsyncThunk(
  'doctors/fetchForPatients',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await getPatientDoctors(page, size);
      return data; // Backend se poora 'Page' object aayega
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

// 2. Fetch Doctors for Admin (Paginated)
export const fetchDoctorsForAdmin = createAsyncThunk(
  'doctors/fetchForAdmin',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await getDoctors(page, size);
      return data; // Backend se poora 'Page' object aayega
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

// 3. Approve Doctor
export const approveDoctorThunk = createAsyncThunk(
  'doctors/approve',
  async (doctorId, { rejectWithValue }) => {
    try {
      await approveDoctor(doctorId);
      return doctorId; // Slice ko ID return kar rahe hain taaki state update kar sake
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve doctor');
    }
  }
);

// 4. Reject Doctor
export const rejectDoctorThunk = createAsyncThunk(
  'doctors/reject',
  async (doctorId, { rejectWithValue }) => {
    try {
      await rejectDoctor(doctorId);
      return doctorId; // Slice ko ID return kar rahe hain taaki state update kar sake
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject doctor');
    }
  }
);