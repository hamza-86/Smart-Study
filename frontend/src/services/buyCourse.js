/**
 * Buy Course Service
 * FILE: src/services/buyCourse.js
 *
 * Handles purchasing courses (paid) and enrolling in free courses
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

/**
 * Handle buying paid courses
 * Initiates payment process via Razorpay or similar
 */
export const BuyCourse = async (token, courseIds, user, navigate) => {
  try {
    // Call backend to create order
    const response = await axios.post(
      `${BASE_URL}/payments/createOrder`,
      { courseIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.success) {
      const { orderId, amount, currency } = response.data.data;

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: amount * 100, // Convert to paise
        currency: currency || "INR",
        order_id: orderId,
        name: "Smart Study",
        description: "Course Purchase",
        image: "/logo.png",
        handler: async (paymentResponse) => {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${BASE_URL}/payments/verifyOrder`,
              {
                orderId: paymentResponse.razorpay_order_id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
                courseIds,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (verifyResponse?.data?.success) {
              alert("Course purchased successfully!");
              navigate("/dashboard/enrolled-courses");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
        },
        theme: {
          color: "#2D3436",
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } else {
      alert(response?.data?.message || "Failed to create order");
    }
  } catch (error) {
    console.error("Buy course error:", error);
    alert(error?.response?.data?.message || "An error occurred while processing your purchase.");
  }
};

/**
 * Enroll in free course
 */
export const enrollFreeCourse = async (courseId, navigate) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${BASE_URL}/courses/enrollFreeCourse`,
      { courseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.success) {
      alert("Enrolled in course successfully!");
      navigate(`/dashboard/course-content/${courseId}`);
    } else {
      alert(response?.data?.message || "Failed to enroll in course");
    }
  } catch (error) {
    console.error("Free course enrollment error:", error);
    alert(
      error?.response?.data?.message || "An error occurred while enrolling in the course."
    );
  }
};

export default BuyCourse;
