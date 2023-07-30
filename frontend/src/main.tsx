import React from "react";
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
import refreshApi from "./components/RefreshApi";

import { AuthProvider, RequireAuth } from "react-auth-kit";
import { QueryClient, QueryClientProvider } from "react-query";

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
  </React.StrictMode>
);
