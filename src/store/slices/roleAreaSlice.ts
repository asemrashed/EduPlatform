import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RoleAreaState {
  /** Current pathname under /student, /instructor, or /admin (set by Providers). */
  activePath: string;
}

const initialState: RoleAreaState = {
  activePath: "",
};

const roleAreaSlice = createSlice({
  name: "roleArea",
  initialState,
  reducers: {
    setRoleAreaPath: (state, action: PayloadAction<string>) => {
      state.activePath = action.payload;
    },
  },
});

export const { setRoleAreaPath } = roleAreaSlice.actions;
export default roleAreaSlice.reducer;
