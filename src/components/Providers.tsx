"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { setRoleAreaPath } from "@/store/slices/roleAreaSlice";
import {
  MOCK_ADMIN_USER,
  MOCK_INSTRUCTOR_USER,
  MOCK_STUDENT_USER,
  setUser,
} from "@/store/slices/authSlice";

function RoleAreaPathTracker() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(setRoleAreaPath(pathname));
    if (pathname.startsWith("/admin")) {
      dispatch(setUser(MOCK_ADMIN_USER));
    } else if (pathname.startsWith("/instructor")) {
      dispatch(setUser(MOCK_INSTRUCTOR_USER));
    } else if (pathname.startsWith("/student") || pathname.startsWith("/dashboard")) {
      dispatch(setUser(MOCK_STUDENT_USER));
    }
  }, [pathname, dispatch]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <RoleAreaPathTracker />
      {children}
    </Provider>
  );
}
