/**
 * Buy Course / Payment Handler
 * FILE: src/services/buyCourse.js
 *
 * Changes from your original:
 *  - Uses axiosInstance (auto-attaches token, no manual Authorization header)
 *  - Sends courseIds[] instead of courses[] (matches new backend)
 *  - Removed sendPaymentSuccessEmail (backend sends it automatically now)
 *  - Added free course enrollment path
 *  - Added coupon code support
 *  - User name built from firstName + lastName (new User model)
 */

import { toast } from "react-hot-toast";
import rzpLogo from "../assets/Logo-Full-Light.png";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, ENROLL_FREE_API } = endpoints;

// ── Load Razorpay SDK from CDN ────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve) => {
    // Don't load twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Buy Course (entry point called from CourseDetails page) ───────────────────
/**
 * @param {string}   token       - access token (kept for backward compat, not used internally)
 * @param {string[]} courseIds   - array of course IDs to purchase
 * @param {object}   user        - logged-in user object { firstName, lastName, email }
 * @param {function} navigate    - react-router navigate function
 * @param {string}   [couponCode] - optional coupon code
 */
export async function BuyCourse(token, courseIds, user, navigate, couponCode = null) {
  const toastId = toast.loading("Processing payment...");
  try {
    // 1. Load Razorpay SDK
    const sdkLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!sdkLoaded) {
      toast.error("Failed to load payment SDK. Check your internet connection.");
      return;
    }

    // 2. Create order on backend
    const orderResponse = await axiosInstance.post(COURSE_PAYMENT_API, {
      courseIds,
      ...(couponCode && { couponCode }),
    });

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    const responseData = orderResponse.data.data;

    // 3. If total is 0 after coupon → free enrollment path
    if (responseData.isFree) {
      toast.dismiss(toastId);
      await enrollFreeCourse(courseIds[0], navigate);
      return;
    }

    const { order, amount, currency } = responseData;

    if (!order) {
      throw new Error("Invalid payment order from server");
    }

    // 4. Open Razorpay checkout
    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY || "",
      currency:    currency || "INR",
      amount:      order.amount,
      order_id:    order.id,
      name:        "EduFlow",
      description: "Thank you for purchasing the course",
      image:       rzpLogo,
      prefill: {
        name:  `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email || "",
      },
      theme: {
        color: "#FFD60A",
      },
      handler: function (response) {
        // Payment successful on Razorpay side — verify on backend
        toast.dismiss(toastId);
        verifyPayment(
          {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            courseIds,
          },
          navigate
        );
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      toast.error("Payment failed. Please try again.");
      console.error("Razorpay payment failed:", response.error);
    });

  } catch (error) {
    console.error("BuyCourse error:", error);
    toast.error(error.response?.data?.message || "Payment could not be initiated");
  } finally {
    toast.dismiss(toastId);
  }
}

// ── Verify Payment with backend ───────────────────────────────────────────────
async function verifyPayment(bodyData, navigate) {
  const toastId = toast.loading("Verifying payment...");
  try {
    const response = await axiosInstance.post(COURSE_VERIFY_API, bodyData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment successful! You are now enrolled in the course.");
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.error("verifyPayment error:", error);
    toast.error(
      "Payment verification failed. If your money was deducted, contact support."
    );
  } finally {
    toast.dismiss(toastId);
  }
}

// ── Enroll in free course ─────────────────────────────────────────────────────
export async function enrollFreeCourse(courseId, navigate) {
  const toastId = toast.loading("Enrolling...");
  try {
    const response = await axiosInstance.post(ENROLL_FREE_API, { courseId });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Enrolled successfully! Start learning now.");
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.error("enrollFreeCourse error:", error);
    toast.error(error.response?.data?.message || "Enrollment failed. Please try again.");
  } finally {
    toast.dismiss(toastId);
  }
}