import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./tailwind.css";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import Challenge from "./pages/Challenge";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import refreshApi from "./components/RefreshApi";
import MyContextProvider from "./components/Context";

import { AuthProvider, RequireAuth } from "react-auth-kit";
import NotFound from "./pages/NotFound";
function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigation />}>
        <Route index element={<Home />} />
        <Route
          path="story"
          element={
            <RequireAuth loginPath={"/login"}>
              <Story />
            </RequireAuth>
          }
        />
        <Route path="community-stories" element={<Community />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route
          path="challenge"
          element={
            <RequireAuth loginPath={"/login"}>
              <Challenge />
            </RequireAuth>
          }
        />
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
        <Route path="*" element={<NotFound />} />
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
          cookieSecure={true}
        >
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </AuthProvider>
      </>
    </MyContextProvider>
  </React.StrictMode>
);
