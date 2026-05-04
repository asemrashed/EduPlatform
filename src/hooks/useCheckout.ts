'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector } from "@/store";
import { usePayment } from "./usePayment";

export const useCheckout = () => {
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);
  // Remove dependency on cart items here to make it more flexible
  
  // Use the tools already built into usePayment
  const { initiatePayment, loading, error: paymentError } = usePayment();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckout = async (courseId?: string) => {
    // 1. Auth Guard
    if (!authUser) {
      alert("Please login to checkout");
      router.push("/login");
      return;
    }

    // 2. Role Guard
    if (authUser?.role !== "student") {
      showToast("Only students can enroll in courses", "error");
      return;
    }

    // 3. ID Validation (Check argument OR fallback to cart)
    if (!courseId) {
      showToast("No course selected", "error");
      return;
    }

    // 4. Use your existing hook logic!
    const result = await initiatePayment({ courseId });

    if (result.success && result.data?.gatewayUrl) {
      window.location.href = result.data.gatewayUrl; 
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