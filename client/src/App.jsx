import { Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import SignupPage from "./pages/SignupPage";
import ProjectsPage from "./pages/ProjectsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
