import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIsAuthenticated } from "react-auth-kit";
import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function NewPassword() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") as string;

  const checkValid = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/reset_password",
      {
        token: token,
      }
    );
    if (res.data.message !== "Token is valid") {
      navigate("/reset-password", {
        state: {
          mainText: "Error!",
          subText: "Invalid reset password link",
        },
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
    checkValid();
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/reset_password",
        {
          token: token,
          new_password: password,
        }
      );
      console.log(res);
      const msg = res.data.message;
      if (msg === "Password reset successful") {
        navigate("/login", {
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

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrong, setPasswordStrong] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordMatch(event.target.value === confirmPassword);
    checkIsPasswordStrong(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    setPasswordMatch(event.target.value === password);
  };

  const checkIsPasswordStrong = (password: string) => {
    if (
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,120}$/.test(
        password
      )
    ) {
      setPasswordStrong(true);
      return true;
    } else {
      setPasswordStrong(false);
      return false;
    }
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-blue-700 capitalize">
          Set New Password
        </h1>
        <form id="login-form" className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              New Password
            </label>
            <div className="flex items-center justify-end">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                  password && !passwordStrong
                    ? "focus:ring-red-300"
                    : "focus:ring-blue-300"
                } focus:outline-none focus:ring focus:ring-opacity-40`}
                placeholder="************"
                value={password}
                onInput={handlePasswordChange}
                onFocus={handlePasswordChange}
                onChange={handlePasswordChange}
                onBlur={handlePasswordChange}
              />
              <button
                className="absolute mt-2 mr-4 focus:outline-none"
                type="button"
                tabIndex={-1}
                onClick={() => {
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
            <p
              className={
                password && !passwordStrong
                  ? "mt-2 text-pink-600 text-sm"
                  : "hidden"
              }
            >
              Password is not strong enough. Please use 8-120 characters with at
              least 1 number, 1 letter and 1 special character [@$!%*#?&].
            </p>
          </div>
          <div className="mb-2">
            <label
              htmlFor="password2"
              className="block text-sm font-semibold text-gray-800"
            >
              Confirm New Password
            </label>
            <div className="flex items-center justify-end">
              <input
                id="password2"
                type={isConfirmPasswordVisible ? "text" : "password"}
                className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                  confirmPassword && !passwordMatch
                    ? "focus:ring-red-300"
                    : "focus:ring-blue-300"
                } focus:outline-none focus:ring focus:ring-opacity-40`}
                placeholder="************"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                className="absolute mt-2 mr-4 focus:outline-none"
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
                }}
              >
                {isConfirmPasswordVisible ? (
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
            <p
              className={
                confirmPassword && !passwordMatch
                  ? "mt-2 text-pink-600 text-sm"
                  : "hidden"
              }
            >
              Passwords are not the same.
            </p>
          </div>
          <div className="mt-6">
            <input
              className={
                passwordStrong && passwordMatch
                  ? `text-sm font-medium w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none`
                  : `text-sm font-medium w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-400 rounded-md cursor-not-allowed focus:outline-none`
              }
              type="submit"
              value="Set New Password"
              disabled={!(passwordStrong && passwordMatch)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
