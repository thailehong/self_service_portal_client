import { dmsAutoLoginApi } from "../services/api/dmsAutoLoginApi";
import { openExternalApplication } from "./appRegistry";

function openPendingExternalTab() {
  const tab = window.open("about:blank", "_blank");

  if (tab) {
    tab.opener = null;
  }

  return tab;
}

function navigatePendingTab(tab, href) {
  if (tab && !tab.closed) {
    tab.location.href = href;
    return;
  }

  openExternalApplication(href);
}

export async function launchExternalApplication(application) {
  if (!application?.href && !application?.returnUrl) {
    return;
  }

  if (application.autoLogin === "dms" && application.returnUrl) {
    const pendingTab = openPendingExternalTab();

    try {
      const href = await dmsAutoLoginApi.buildUrl(
        application.returnUrl,
        application.autoLoginTarget,
      );
      navigatePendingTab(pendingTab, href || application.href);
    } catch (error) {
      if (pendingTab && !pendingTab.closed) {
        pendingTab.close();
      }
      throw error;
    }

    return;
  }

  openExternalApplication(application.href);
}
