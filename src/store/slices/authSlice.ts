import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getSession, signOut } from "next-auth/react";
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

export const authInitialState: AuthState = {
  status: "unauthenticated",
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const sessionUser = session?.user;
      if (!sessionUser?.email) return null;

      const names = (sessionUser.name || "").trim().split(/\s+/).filter(Boolean);
      const firstName = names[0] || "User";
      const lastName = names.slice(1).join(" ") || "";
      const sessionRole = sessionUser.role;
      if (
        sessionRole !== "admin" &&
        sessionRole !== "instructor" &&
        sessionRole !== "student"
      ) {
        return rejectWithValue("Invalid session role");
      }

      const user: User = {
        _id: sessionUser.id ?? sessionUser.email,
        id: sessionUser.id,
        name: sessionUser.name ?? `${firstName} ${lastName}`.trim(),
        email: sessionUser.email,
        firstName,
        lastName,
        role: sessionRole,
        isActive: true,
        image: sessionUser.image ?? undefined,
        avatar: sessionUser.image ?? undefined,
        createdAt: "",
        updatedAt: "",
      };

      return user;
    } catch {
      return rejectWithValue("Auth check failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut({ redirect: false });
      return null;
    } catch {
      return rejectWithValue("Logout failed");
    }
  },
);

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
        state.user = null;
        state.isAuthenticated = false;
        state.status = "unauthenticated";
        state.error =
          (action.payload as string) ??
          action.error.message ??
          "Auth check failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "unauthenticated";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error =
          (action.payload as string) ??
          action.error.message ??
          "Logout failed";
      });
  },
});

export const { resetAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
