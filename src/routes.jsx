import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/PrivateRouteTEMP";
import { DashboardPage } from "./pages/Dashboard/Dashboard";
import { Events } from "./pages/Events/events";
import { Evidences } from "./pages/Evidences/Evidences";
import { Fines } from "./pages/Fines/Fines";
import { FineClaims } from "./pages/FineClaims/FineClaims";
import { Auth } from "./pages/auth";
import { PasswordRecoveryPage } from "./pages/recover-password/PasswordRecoveryPage";
import { Requests } from "./pages/Requests/Requests";
import { MyProfile } from "./pages/user/myProfile";
import { ProfileUpdate } from "./pages/user/ProfileUpdate";
import { Vehicles } from "./pages/vehicles";
import { StreamPage } from "./pages/Stream/StreamPage";
import { Users } from "./pages/Users/Users";

const routes = [
  { path: "/", element: <Auth /> },
  { path: "/recover-password", element: <PasswordRecoveryPage /> },
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute roles={["CITIZEN_ROLE", "ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"]}><MyProfile /></ProtectedRoute>,
  },
  {
    path: "/profile/edit",
    element: <ProtectedRoute roles={["CITIZEN_ROLE", "ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"]}><ProfileUpdate /></ProtectedRoute>,
  },
  {
    path: "/events",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"]}><Events /></ProtectedRoute>,
  },
  {
    path: "/vehicles",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE"]}><Vehicles /></ProtectedRoute>,
  },
  {
    path: "/evidences",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"]}><Evidences /></ProtectedRoute>,
  },
  {
    path: "/fines",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "CITIZEN_ROLE"]}><Fines /></ProtectedRoute>,
  },
  {
    path: "/fine-claims",
    element: <ProtectedRoute roles={["CITIZEN_ROLE", "SYSTEM_ROLE", "ADMIN_ROLE"]}><FineClaims /></ProtectedRoute>,
  },
  {
    path: "/stream",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"]}><StreamPage /></ProtectedRoute>,
  },
  {
    path: "/requests",
    element: <ProtectedRoute roles={["ADMIN_ROLE", "OPERATOR_ROLE", "CITIZEN_ROLE"]}><Requests /></ProtectedRoute>,
  },
  {
    path: "/users",
    element: <ProtectedRoute roles={["ADMIN_ROLE"]}><Users /></ProtectedRoute>,
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];

export default routes;
