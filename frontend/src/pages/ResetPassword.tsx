import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Cookies from "js-cookie";

export default function ResetPassword() {
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailUsername = (
      document.getElementById("emailUsername") as HTMLInputElement
    ).value;

    navigate("/login", {
      state: {
        color: "green",
        mainText: "Success!",
        subText: "Password reset link sent to your email",
      },
    });
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 capitalize">
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
              className="block w-full peer px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Email or Username"
              required
            />
          </div>
          <div className="mt-6">
            <input
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
              type="submit"
              value="Reset Password"
            />
          </div>
        </form>

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
