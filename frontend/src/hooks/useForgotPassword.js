import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { forgotPasswordRequest } from "../services/api/auth.api";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      toast.success("OTP sent if this email exists");
    },
    onError: () => {
      toast.success("OTP sent if this email exists");
    },
  });

export default useForgotPassword;
