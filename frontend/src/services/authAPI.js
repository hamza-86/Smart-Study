import axios from "axios";
import { endpoints } from "./api";

const { LOGOUT_API } = endpoints;

export const logoutUser = async (token) => {
  try {
    await axios.post(
      LOGOUT_API,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};