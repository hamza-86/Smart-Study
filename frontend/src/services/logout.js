import { logoutUser as performLogout } from "./Authservices";

export const logoutUser = async (dispatch, navigate) => {
  await performLogout(null, dispatch, navigate);
};

export default logoutUser;
