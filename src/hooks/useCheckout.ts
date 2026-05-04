'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector } from "@/store";
import { usePayment } from "./usePayment";

type CheckoutInput =
  | string
  | {
      courseId?: string;
      courseIds?: string[];
    };

export const useCheckout = () => {
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);
  const cartItems = useAppSelector((s) => s.cart.items);
  
  // Use the tools already built into usePayment
  const { initiatePayment, loading } = usePayment();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckout = async (input?: CheckoutInput) => {
    if (!authUser) {
      alert("Please login to checkout");
      router.push("/login");
      return;
    }

    if (authUser?.role !== "student") {
      showToast("Only students can enroll in courses", "error");
      return;
    }

    const explicitCourseId = typeof input === "string" ? input : input?.courseId;
    const explicitCourseIds =
      typeof input === "string" ? [] : (input?.courseIds ?? []);

    const sourceIds =
      explicitCourseIds.length > 0
        ? explicitCourseIds
        : explicitCourseId
          ? [explicitCourseId]
          : cartItems.map((item) => item.courseId);

    const courseIds = Array.from(new Set(sourceIds.filter(Boolean)));

    if (courseIds.length === 0) {
      showToast("No course selected", "error");
      return;
    }

    const payload =
      courseIds.length === 1
        ? { courseId: courseIds[0] }
        : { courseIds };

    const result = await initiatePayment(payload);

    if (result.success && result.data?.checkout_url) {
      window.location.href = result.data.checkout_url;
    } else {
      showToast(result.error || "Checkout failed", "error");
    }
  };

  return { 
    handleCheckout, 
    isPending: loading, 
    toastMessage: toast?.message, 
    toastType: toast?.type 
  };
};
