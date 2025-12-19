import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SignIn from "./pages/Auth/SignIn"
import CreateAccount from "./pages/Auth/CreateAccount"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import UploadDocuments from "./pages/UploadDocuments"
import ScenarioAnalysis from "./pages/ScenarioAnalysis"
import Notifications from "./pages/Notifications"
import ProtectedRoute from "./components/ProtectedRoute"

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Authentication Pages */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<CreateAccount />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario-analysis"
          element={
            <ProtectedRoute>
              <ScenarioAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<h1 className="text-center text-2xl">404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  )
}
