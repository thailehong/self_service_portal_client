import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HrAdminPage } from "../pages/HrAdminPage";
import { HrAdminFeaturePage } from "../pages/HrAdminFeaturePage";
import { MealOrdersPage } from "../pages/MealOrdersPage";
import { BookingBusPage } from "../pages/BookingBusPage";
import { AdministratorPage } from "../pages/AdministratorPage";
import { EWorkflowPage } from "../pages/EWorkflowPage";
import { HelpCenterPage } from "../pages/HelpCenterPage";
import { WorkspaceSectionPage } from "../pages/WorkspaceSectionPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ADMINISTRATOR_ROLE_IDS } from "../utils/roles";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="eworkflow" element={<EWorkflowPage />} />
        <Route path="hr-admin" element={<HrAdminPage />} />
        <Route path="hr-admin/order-meal" element={<MealOrdersPage />} />
        <Route path="hr-admin/booking-bus" element={<BookingBusPage />} />
        <Route path="hr-admin/:featureId" element={<HrAdminFeaturePage />} />
        <Route path="help/center" element={<HelpCenterPage />} />
        <Route
          path="administrator"
          element={
            <RoleProtectedRoute allowedRoleIds={ADMINISTRATOR_ROLE_IDS}>
              <AdministratorPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="*" element={<WorkspaceSectionPage />} />
      </Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
