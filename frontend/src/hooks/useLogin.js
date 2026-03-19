import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { loginRequest } from "../services/api/auth.api";
import { setToken, setUser } from "../slices/authSlice";

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (result) => {
      const { accessToken, user } = result?.data || {};
      if (!result?.success || !accessToken || !user) {
        throw new Error(result?.message || "Login failed");
      }

      dispatch(setToken(accessToken));
      dispatch(setUser(user));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.firstName}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Login failed");
    },
  });
};

export default useLogin;
