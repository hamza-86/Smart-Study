import { toast } from "react-hot-toast";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, ENROLL_FREE_API } = endpoints;

const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const BuyCourse = async (_token, courseIds, user, navigate) => {
  const toastId = toast.loading("Processing payment...");
  try {
    const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!sdkLoaded) {
      toast.error("Failed to load payment SDK. Check your internet connection.");
      return;
    }

    const key = process.env.REACT_APP_RAZORPAY_KEY;
    if (!key) {
      toast.error("Payment key is missing. Add REACT_APP_RAZORPAY_KEY in frontend .env.");
      return;
    }

    const orderResponse = await axiosInstance.post(COURSE_PAYMENT_API, { courseIds });
    if (!orderResponse?.data?.success) {
      throw new Error(orderResponse?.data?.message || "Failed to create order");
    }

    const { isFree, order, amount, currency } = orderResponse.data.data || {};

    if (isFree) {
      toast.dismiss(toastId);
      await enrollFreeCourse(courseIds[0], navigate);
      return;
    }

    if (!order?.id) {
      throw new Error("Invalid payment order from server");
    }

    const options = {
      key,
      amount: order.amount || Math.round((amount || 0) * 100),
      currency: currency || "INR",
      order_id: order.id,
      name: "Smart Study",
      description: "Course Purchase",
      handler: async (paymentResponse) => {
        try {
          const verifyResponse = await axiosInstance.post(COURSE_VERIFY_API, {
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            courseIds,
          });

          if (!verifyResponse?.data?.success) {
            throw new Error(verifyResponse?.data?.message || "Payment verification failed");
          }

          toast.success("Payment successful. Course unlocked.");
          navigate("/dashboard/enrolled-courses");
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error(
            error?.response?.data?.message ||
              "Payment verification failed. If amount was deducted, contact support."
          );
        }
      },
      prefill: {
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email || "",
      },
      theme: { color: "#FACC15" },
    };

    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
    razorpayWindow.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
    });
  } catch (error) {
    console.error("Buy course error:", error);
    toast.error(error?.response?.data?.message || error?.message || "Purchase failed");
  } finally {
    toast.dismiss(toastId);
  }
};

export const enrollFreeCourse = async (courseId, navigate) => {
  const toastId = toast.loading("Enrolling...");
  try {
    const response = await axiosInstance.post(ENROLL_FREE_API, { courseId });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to enroll");
    }

    toast.success("Enrolled successfully.");
    navigate(`/dashboard/course-content/${courseId}`);
  } catch (error) {
    console.error("Free course enrollment error:", error);
    toast.error(error?.response?.data?.message || "Enrollment failed");
  } finally {
    toast.dismiss(toastId);
  }
};

export default BuyCourse;
