import React from "react";
import { Link, Navigate } from "react-router-dom";

export default function SignOut() {
  //sign out logic

  return (
    <Navigate
      to="/login"
      state={{
        color: "green",
        mainText: "Success!",
        subText: "Signed out successfully.",
      }}
    />
  );
}
