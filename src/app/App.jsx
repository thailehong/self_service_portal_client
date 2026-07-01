import { useCallback, useEffect, useState } from "react";
import { AppProviders } from "./AppProviders";
import { MaintenancePage } from "../pages/MaintenancePage";
import { AppRoutes } from "../routes/AppRoutes";
import { maintenanceApi } from "../services/api/maintenanceApi";

export default function App() {
  const [maintenanceState, setMaintenanceState] = useState({
    loading: true,
    error: "",
    status: null,
  });

  const loadMaintenanceStatus = useCallback(async () => {
    setMaintenanceState((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    try {
      const status = await maintenanceApi.getStatus();
      setMaintenanceState({
        loading: false,
        error: "",
        status,
      });
    } catch (error) {
      setMaintenanceState({
        loading: false,
        error: error.response?.data?.message || error.message || "Could not check portal status.",
        status: null,
      });
    }
  }, []);

  useEffect(() => {
    loadMaintenanceStatus();
  }, [loadMaintenanceStatus]);

  const content = maintenanceState.loading ? (
    <MaintenancePage loading />
  ) : maintenanceState.error ? (
    <MaintenancePage error={maintenanceState.error} onRetry={loadMaintenanceStatus} />
  ) : maintenanceState.status?.maintenanceEnable ? (
    <MaintenancePage
      title={maintenanceState.status.maintenanceTitle}
      message={maintenanceState.status.maintenanceMessage}
      onRetry={loadMaintenanceStatus}
    />
  ) : (
    <AppRoutes />
  );

  return <AppProviders>{content}</AppProviders>;
}
