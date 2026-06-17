import packageJson from "../../package.json";

export const APP_NAME = "DMS Portal";
export const APP_VERSION = packageJson.version;

export const APP_VERSION_HISTORY = [
  {
    version: APP_VERSION,
    releaseDate: "Jun 17, 2026",
    summary:
      "Introduced eWorkflow functionality, allowing users to design workflows, step approvals, and custom fields for all types of workflows.",
    items: [
      {
        title: "Dashboard",
        description: "Re-layout components and change the app to DMS Portal.",
        tags: ["Dashboard", "Self-service"],
      },
      {
        title: "eWorkflow",
        description: "Fixed issues and improved performance.",
        tags: ["Administration", "Self-service", "Monitoring"],
      },
    ],
  },
  {
    version: "1.0.1",
    releaseDate: "Jun 4, 2026",
    summary:
      "Introduced eWorkflow functionality, allowing users to design workflows, step approvals, and custom fields for all types of workflows.",
    items: [
      {
        title: "eWorkflow",
        description:
          "Release eWorkflow module, allowing user design workflow, step approval, custom fields for all types of workflows",
        tags: ["eWorkflow", "Self-service"],
      },
      {
        title: "Administration",
        description:
          "Added function Monitoring - to monitor users and APIs, track slow APIs, and monitor the number of concurrent users, or by day/month/year.",
        tags: ["Administration", "Self-service", "Monitoring"],
      },
      {
        title: "Help Center",
        description:
          "Added function Report an issue - allowing users to report app issues and track their status from opening to closing.",
        tags: ["Help Center", "Self-service", "Report an issue"],
      },
    ],
  },
  {
    version: "1.0.0",
    releaseDate: "May 21, 2026",
    summary:
      "Expanded the workspace with HR & Admin services, version history, and a cleaner app-wide footer/sidebar information model.",
    items: [
      {
        title: "Release first draft version",
        description:
          "Release core features of the DMS Portal, including the main landing page, authentication, and basic navigation.",
        tags: ["HR & Admin", "Self-service", "Workspace"],
      },
      {
        title: "Dashboard",
        description:
          "Added a Dashboard page to provide employees with an overview of their tasks, notifications, and important updates.",
        tags: ["Dashboard", "Notifications", "Department Updates"],
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
          "Add functionality to create and assign permissions for users accessing the portal.",
        tags: ["Administration", "Access Control"],
      },
    ],
  },
];
