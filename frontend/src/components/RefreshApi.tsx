import { createRefresh } from "react-auth-kit";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

// export type refreshTokenCallback = (param: {
//   authToken?: string;
//   authTokenExpireAt?: Date;
//   refreshToken?: string;
//   refreshTokenExpiresAt?: Date;
//   authUserState: AuthStateUserObject | null;
// }) => Promise<RefreshTokenCallbackResponse>;

const refreshApi = createRefresh({
  interval: 10, // Refreshs the token in every 10 minutes
  refreshApiCallback: async ({ refreshToken }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      const newAuthToken: string = response.data.accessToken;
      return {
        isSuccess: true,
        newAuthToken: newAuthToken,
        newAuthTokenExpireIn: 15, // 15 mins
      };
    } catch (error) {
      console.error(error);
      return {
        isSuccess: false,
        newAuthToken: "",
      };
    }
  },
});

export default refreshApi;
