import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "react-auth-kit";
import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function ResetPassword() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [renderLoad, setRenderLoad] = useState(false);
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  });
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailUsername = (
      document.getElementById("emailUsername") as HTMLInputElement
    ).value;
    setRenderLoad(true);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/reset_password_request",
      {
        emailUsername: emailUsername,
      }
    );

    if (res.data.message === "Password reset link sent to your email") {
      setRenderLoad(false);
      navigate("/login", {
        state: {
          mainText: "Success!",
          subText: "Password reset link sent to your email",
        },
      });
    } else {
      setRenderLoad(false);
      navigate("/reset-password", {
        state: {
          mainText: "Error!",
          subText: "Email or username not found",
        },
      });
    }
  };

  const location = useLocation();
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
        <h1 className="text-3xl font-semibold text-center text-blue-700 capitalize">
          Reset Password
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
              className="block w-full peer px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Email or Username"
              required
            />
          </div>
          <div className="mt-6">
            <button
              className="text-sm font-medium w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
              type="submit"
              disabled={renderLoad}
            >
              {renderLoad ? (
                <>
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 mr-3 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-xs font-light text-center text-gray-700">
          {" "}
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
