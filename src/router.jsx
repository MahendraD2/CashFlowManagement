import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/Auth/SignIn";
import CreateAccount from "./pages/Auth/CreateAccount";
import OTPVerification from "./pages/Auth/OTPVerification";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UploadDocuments from "./pages/UploadDocuments";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import Notifications from "./pages/Notifications";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Authentication Pages */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<CreateAccount />} />
        <Route path="/otp-verification" element={<OTPVerification />} />

        {/* Main App Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadDocuments />} />
        <Route path="/scenario-analysis" element={<ScenarioAnalysis />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <h1 className="text-center text-2xl">404 - Page Not Found</h1>
          }
        />
      </Routes>
    </Router>
  );
}
