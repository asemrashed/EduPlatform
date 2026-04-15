import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "@/types/user";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function withSessionFields(u: User): User {
  const display =
    u.name ??
    (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email);
  return {
    ...u,
    id: u.id ?? u._id,
    name: display,
  };
}

const now = new Date().toISOString();

/** Mock student — used when visiting `/student/*` role-area routes. */
export const MOCK_STUDENT_USER: User = withSessionFields({
  _id: "mock-user-id",
  email: "student@eduplatform.local",
  firstName: "Mock",
  lastName: "Student",
  role: "student",
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

/** Mock instructor — used when visiting `/instructor/*`. */
export const MOCK_INSTRUCTOR_USER: User = withSessionFields({
  _id: "507f1f77bcf86cd799439031",
  email: "karim@example.com",
  firstName: "Dr. Karim",
  lastName: "Rahman",
  role: "instructor",
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

/** Mock admin — used when visiting `/admin/*`. */
export const MOCK_ADMIN_USER: User = withSessionFields({
  _id: "mock-admin",
  email: "admin@eduplatform.local",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

export const authInitialState: AuthState = {
  status: "unauthenticated",
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async () => MOCK_ADMIN_USER,
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => null);

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    resetAuth: () => ({ ...authInitialState }),
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload ? withSessionFields(action.payload) : null;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload ? withSessionFields(action.payload) : null;
        state.isAuthenticated = !!action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Auth check failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "unauthenticated";
      });
  },
});

export const { resetAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
