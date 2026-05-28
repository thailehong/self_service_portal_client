export function openNotificationLink(link, navigate) {
  const target = String(link || "").trim();

  if (!target) {
    return false;
  }

  try {
    const url = new URL(target, window.location.origin);
    const internalTarget = `${url.pathname}${url.search}${url.hash}`;

    if (url.origin === window.location.origin || url.pathname.startsWith("/dashboard")) {
      navigate(internalTarget);
      return true;
    }

    window.open(url.href, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    navigate(target.startsWith("/") ? target : `/${target}`);
    return true;
  }
}
