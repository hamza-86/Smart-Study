/**
 * Payment Services
 * FILE: src/services/paymentServices.js
 *
 * Handles Razorpay payment flow and free course enrollment
 */

import { toast } from "react-hot-toast";
import rzpLogo from "../assets/Logo-Full-Light.png";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  ENROLL_FREE_API,
  VALIDATE_COUPON_API,
} = endpoints;

// ── Load Razorpay SDK ─────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Buy Course (paid) ─────────────────────────────────────────────────────────
export async function BuyCourse(token, courseIds, user, navigate, couponCode = null) {
  const toastId = toast.loading("Initialising payment...");
  try {
    const sdkLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!sdkLoaded) {
      toast.error("Failed to load payment SDK. Check your internet connection.");
      return;
    }

    // Create order
    const orderResponse = await axiosInstance.post(COURSE_PAYMENT_API, {
      courseIds,
      couponCode: couponCode || undefined,
    });

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    const { order, amount, currency } = orderResponse.data.data;

    // If total is 0 after coupon → use free enroll instead
    if (orderResponse.data.data.isFree) {
      toast.dismiss(toastId);
      await enrollFreeCourse(courseIds[0], navigate);
      return;
    }

    const options = {
      key:      process.env.REACT_APP_RAZORPAY_KEY || "",
      currency: currency || "INR",
      amount:   order.amount,
      order_id: order.id,
      name:     "EduFlow",
      description: "Thank you for purchasing the course.",
      image:    rzpLogo,
      prefill: {
        name:  `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email || "",
      },
      theme: { color: "#FFD60A" },
      handler: function (response) {
        toast.dismiss(toastId);
        verifyPayment(
          { ...response, courseIds },
          navigate
        );
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
    });

  } catch (error) {
    console.error("Payment error:", error);
    toast.error(error.response?.data?.message || "Payment could not be initiated");
  } finally {
    toast.dismiss(toastId);
  }
}

// ── Verify Payment ────────────────────────────────────────────────────────────
async function verifyPayment(bodyData, navigate) {
  const toastId = toast.loading("Verifying payment...");
  try {
    const response = await axiosInstance.post(COURSE_VERIFY_API, bodyData);

    if (response.data.success) {
      toast.success("Payment successful! You are now enrolled.");
      navigate("/dashboard/enrolled-courses");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    toast.error("Payment verification failed. Contact support if amount was deducted.");
  } finally {
    toast.dismiss(toastId);
  }
}

// ── Enroll Free Course ────────────────────────────────────────────────────────
export async function enrollFreeCourse(courseId, navigate) {
  const toastId = toast.loading("Enrolling...");
  try {
    const response = await axiosInstance.post(ENROLL_FREE_API, { courseId });

    if (response.data.success) {
      toast.success("Enrolled successfully! Start learning now.");
      navigate("/dashboard/enrolled-courses");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Enrollment failed");
  } finally {
    toast.dismiss(toastId);
  }
}

// ── Validate Coupon ───────────────────────────────────────────────────────────
export async function validateCoupon(code, courseIds, totalAmount) {
  try {
    const response = await axiosInstance.post(VALIDATE_COUPON_API, {
      code,
      courseIds,
      totalAmount,
    });
    return response.data.data; // { discountAmount, finalAmount, discountType, ... }
  } catch (error) {
    toast.error(error.response?.data?.message || "Invalid coupon code");
    return null;
  }
}