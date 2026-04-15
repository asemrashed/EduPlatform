import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { studentPassPapersService } from "@/services/studentPassPapersService";
import type { PassPaperRow } from "@/types/passPaper";
import type { EnrollmentListData } from "@/types/enrollmentList";

export const loadStudentPassPapers = createAsyncThunk(
  "studentPassPapers/load",
  async () => studentPassPapersService.load(),
);

export interface StudentPassPapersState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  enrollmentData: EnrollmentListData | null;
  passPapers: PassPaperRow[];
}

const initialState: StudentPassPapersState = {
  status: "idle",
  error: null,
  enrollmentData: null,
  passPapers: [],
};

const studentPassPapersSlice = createSlice({
  name: "studentPassPapers",
  initialState,
  reducers: {
    clearStudentPassPapersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStudentPassPapers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadStudentPassPapers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrollmentData = action.payload.enrollmentData;
        state.passPapers = action.payload.passPapers;
      })
      .addCase(loadStudentPassPapers.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message ?? "Could not load pass papers for your courses.";
      });
  },
});

export const { clearStudentPassPapersError } = studentPassPapersSlice.actions;
export default studentPassPapersSlice.reducer;
