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
import Profile from "./pages/Profile";
import SignOut from "./components/SignOut";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path="story" element={<Story />} />
        <Route path="community-stories" element={<Community />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="top-stories" element={<TopStories />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="sign-out" element={<SignOut />} />
        <Route path="login" element={<Login />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </React.StrictMode>
);
