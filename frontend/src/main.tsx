import React, { useContext, createContext, useState } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./tailwind.css";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import TopStories from "./pages/TopStories";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import refreshApi from "./components/RefreshApi";
import MyContextProvider from "./components/Context";

import { AuthProvider, RequireAuth } from "react-auth-kit";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path="story" element={<Story />} />
        <Route path="community-stories" element={<Community />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="top-stories" element={<TopStories />} />
        <Route
          path="settings"
          element={
            <RequireAuth loginPath={"/login"}>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="profile">
          <Route path=":id" element={<Profile />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="reset-new-password" element={<NewPassword />} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MyContextProvider>
      <>
        <AuthProvider
          authType="cookie"
          authName="_auth"
          cookieDomain={window.location.hostname}
          refresh={refreshApi}
          cookieSecure={false}
        >
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </AuthProvider>
      </>
    </MyContextProvider>
  </React.StrictMode>
);
