import packageJson from "../../package.json";

export const APP_NAME = "Employee Portal";
export const APP_VERSION = packageJson.version;

export const APP_VERSION_HISTORY = [
  {
    version: APP_VERSION,
    releaseDate: "May 21, 2026",
    summary:
      "Expanded the workspace with HR & Admin services, version history, and a cleaner app-wide footer/sidebar information model.",
    items: [
      {
        title: "Release first draft version",
        description:
          "Release core features of the Employee Portal, including the main landing page, authentication, and basic navigation.",
        tags: ["HR & Admin", "Self-service", "Workspace"],
      },
      {
        title: "Dashboard",
        description:
          "Added a Dashboard page to provide employees with an overview of their tasks, notifications, and important updates.",
        tags: ["Routing", "Detail pages", "Scalable structure"],
      },
      {
        title: "HR & Admin",
        description:
          "Added a dedicated HR & Admin landing page with service cards for Order Meal, Booking Bus, Visitor Management",
        tags: ["HR & Admin", "Self-service", "Workspace"],
      },
      {
        title: "Administration",
        description:
          "Added an Administration page for managing employee information, including personal details, job information, and access permissions.",
        tags: ["Routing", "Detail pages", "Scalable structure"],
      },
    ],
  },
];
