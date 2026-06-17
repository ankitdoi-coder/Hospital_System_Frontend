import { createSlice } from '@reduxjs/toolkit';

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    list: [],
    loading: false,
    pendingDoctors: [],
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
      const doctorIndex = state.list.findIndex(doc => doc.id === doctorId);
      if (doctorIndex !== -1) {
        state.list[doctorIndex].isApproved = true;
        state.list[doctorIndex].status = 'APPROVED';
      }
    },
    rejectDoctor: (state, action) => {
      const doctorId = action.payload;
      const doctorIndex = state.list.findIndex(doc => doc.id === doctorId);
      if (doctorIndex !== -1) {
        state.list[doctorIndex].isApproved = false;
        state.list[doctorIndex].status = 'REJECTED';
      }
    },
  },
});

export const { setLoading, setDoctors, setPendingDoctors, approveDoctor, rejectDoctor } = doctorsSlice.actions;
export default doctorsSlice.reducer;