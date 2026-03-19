import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { resetPasswordRequest } from "../services/api/auth.api";

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: (result) => {
      toast.success(result?.message || "Password reset successful");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Password reset failed");
    },
  });

export default useResetPassword;
