import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSignIn, useIsAuthenticated } from "react-auth-kit";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Login() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  });

  const location = useLocation();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const signIn = useSignIn();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailUsername = (
      document.getElementById("emailUsername") as HTMLInputElement
    ).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    // const staySignedIn = (
    //   document.getElementById("remember") as HTMLInputElement
    // ).checked;
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/login",
        {
          emailUsername: emailUsername,
          password: password,
        }
      );
      console.log(res);
      const msg = res.data.message;
      if (msg === "Login successful") {
        signIn({
          token: res.data.accessToken,
          expiresIn: res.data.expiresIn,
          tokenType: "Bearer",
          authState: { username: res.data.username },
          refreshToken: res.data.refreshToken,
          refreshTokenExpireIn: res.data.refreshTokenExpireIn,
        });
        navigate("/", {
          state: { mainText: "Success!", subText: msg },
        });
      } else {
        navigate("/login", {
          state: { mainText: "Error!", subText: msg },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  let alertDiv;
  if (location.state) {
    // console.log(className);
    alertDiv = (
      <>
        <div
          className={
            location.state.mainText == "Success!"
              ? "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              : "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          }
          role="alert"
        >
          <strong className="font-bold">{location.state.mainText} </strong>
          <span className="block sm:inline">{location.state.subText}</span>
        </div>
        <br></br>
      </>
    );
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        {alertDiv}
        <h1 className="text-3xl font-semibold text-center text-purple-700 capitalize">
          Login
        </h1>
        <form id="login-form" className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email or Username
            </label>
            <input
              id="emailUsername"
              type="text"
              className="block w-full peer px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Email or Username"
              required
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <div className="flex items-center justify-end">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="************"
                required
              />
              <button
                className="absolute mt-2 mr-4 focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  setIsPasswordVisible(!isPasswordVisible);
                }}
              >
                {isPasswordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {/* <div className="flex">
            <input id="remember" type="checkbox" className="mr-1" />
            <label
              htmlFor="remember"
              className="block text-sm font-semibold text-gray-600"
            >
              Stay Signed In
            </label> */}
          <Link
            to="/reset-password"
            className="ml-auto text-sm text-purple-600 hover:underline"
          >
            Forget Password?
          </Link>
          {/* </div> */}
          <div className="mt-6">
            <input
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
              type="submit"
              value="Login"
            />
          </div>
        </form>
        {/* google sign in*/}
        {/* <div className="relative flex items-center justify-center w-full mt-6 border border-t">
          <div className="absolute px-5 bg-white">Or</div>
        </div>
        <div className="flex mt-4 gap-x-2">
          <button
            type="button"
            className="flex items-center justify-center w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-violet-600"
          >
            <p className="mr-2 text-gray-600">Sign in with</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-5 h-5 fill-current"
            >
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
            </svg>
          </button>
        </div> */}

        <p className="mt-8 text-xs font-light text-center text-gray-700">
          {" "}
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-purple-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
