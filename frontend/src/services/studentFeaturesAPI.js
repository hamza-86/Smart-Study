import { toast } from "react-hot-toast";
import rzpLogo from "../assets/Logo-Full-Light.png";
import { endpoints } from "../services/api";
import axios from "axios";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = endpoints;

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Buy the Course
export async function BuyCourse(token, courses, user_details, navigate) {
  const toastId = toast.loading("Processing Payment...");
  try {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Failed to load Razorpay SDK.");
      toast.dismiss(toastId);
      return;
    }

    const orderResponse = await axios.post(
      COURSE_PAYMENT_API,
      { courses },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    const orderData = orderResponse.data.order;

    if (!orderData) {
      throw new Error("Invalid payment order response");
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || "",
      currency: orderData.currency,
      amount: orderData.amount,
      order_id: orderData.id,
      name: "Smart Study",
      description: "Thank you for purchasing the course.",
      image: rzpLogo,
      prefill: {
        name: user_details?.name,
        email: user_details?.email,
      },
      handler: function (response) {
        sendPaymentSuccessEmail(
          response,
          orderData.amount,
          token
        );
        verifyPayment({ ...response, courses }, token, navigate);
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function () {
      toast.error("Payment Failed.");
    });
  } catch (error) {
    console.error("Payment Error:", error.message);
    toast.error("Payment Failed.");
  }
  toast.dismiss(toastId);
}

// Verify the Payment
async function verifyPayment(bodyData, token, navigate) {
  const toastId = toast.loading("Verifying Payment...");
  try {
    const response = await axios.post(COURSE_VERIFY_API, bodyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment Successful. You are Added to the course ");
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR............", error);
    toast.error("Could Not Verify Payment.");
  }
  toast.dismiss(toastId);
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await axios.post(
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error);
  }
}
