import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { tokenManager } from "../services/api/client";

const heartbeatIntervalMs = 30_000;
const reconnectDelayMs = 10_000;

function getPresenceHubUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  if (apiBaseUrl.endsWith("/api")) {
    return `${apiBaseUrl.slice(0, -4)}/hubs/presence`;
  }

  return "/hubs/presence";
}

export function usePortalPresence(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let disposed = false;
    let heartbeatTimer = null;
    let reconnectTimer = null;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getPresenceHubUrl(), {
        withCredentials: true,
        accessTokenFactory: () => tokenManager.getAccessToken() || "",
      })
      .withAutomaticReconnect()
      .build();

    const clearHeartbeat = () => {
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    };

    const sendHeartbeat = async () => {
      if (
        disposed ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        return;
      }

      try {
        await connection.invoke("Heartbeat");
      } catch {
        // Presence is best-effort and should never interrupt portal usage.
      }
    };

    const startHeartbeat = () => {
      clearHeartbeat();
      void sendHeartbeat();
      heartbeatTimer = window.setInterval(sendHeartbeat, heartbeatIntervalMs);
    };

    const scheduleStart = () => {
      if (disposed || reconnectTimer) {
        return;
      }

      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        void start();
      }, reconnectDelayMs);
    };

    connection.onreconnected(startHeartbeat);
    connection.onclose(() => {
      clearHeartbeat();
      scheduleStart();
    });

    const start = async () => {
      try {
        await connection.start();
        startHeartbeat();
      } catch {
        // Presence reconnects on navigation/reload; ignore startup failures.
        scheduleStart();
      }
    };

    void start();

    return () => {
      disposed = true;
      clearHeartbeat();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      void connection.stop();
    };
  }, [isAuthenticated]);
}
