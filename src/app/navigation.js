import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { ADMINISTRATOR_ROLE_IDS, hasAnyRole } from "../utils/roles";

export const sidebarNavigation = [
  {
    id: "home",
    labelKey: "nav.home",
    to: "/",
    end: true,
    icon: HomeRoundedIcon,
  },
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    to: "/dashboard",
    end: true,
    icon: DashboardRoundedIcon,
  },
  {
    id: "eworkflow",
    label: "eWorkflow",
    to: "/dashboard/eworkflow",
    end: true,
    icon: AccountTreeRoundedIcon,
    workspaceSection: true,
    meta: {
      metricValues: ["18", "4", "2d"],
      accentColor: "primary.main",
    },
  },
  {
    id: "hr_admin",
    labelKey: "nav.hr_admin",
    to: "/dashboard/hr-admin",
    end: false,
    icon: PeopleRoundedIcon,
  },
  {
    id: "administrator",
    label: "Administrator",
    to: "/dashboard/administrator",
    end: true,
    icon: AdminPanelSettingsRoundedIcon,
    allowedRoleIds: ADMINISTRATOR_ROLE_IDS,
  },
  {
    id: "help",
    labelKey: "nav.help",
    icon: HelpCenterRoundedIcon,
    children: [
      {
        id: "help-center",
        labelKey: "navChildren.helpCenter",
        to: "/dashboard/help/center",
        meta: {
          metricValues: ["24", "8", "1d"],
          accentColor: "secondary.main",
        },
      },
      {
        id: "help-service-requests",
        labelKey: "navChildren.serviceRequests",
        to: "/dashboard/help/service-requests",
        meta: {
          metricValues: ["9", "3", "4h"],
          accentColor: "error.main",
        },
      },
    ],
  },
];

function canDisplayNavigationItem(item, user) {
  if (!item.allowedRoleIds?.length) {
    return true;
  }

  return hasAnyRole(user, item.allowedRoleIds);
}

export function getSidebarNavigationForUser(user) {
  return sidebarNavigation.filter((item) =>
    canDisplayNavigationItem(item, user),
  );
}

export function getNavigationLabel(item, t) {
  return item.labelKey ? t(item.labelKey) : item.label;
}

function flattenSearchableNavigation(navigationItems) {
  return navigationItems.flatMap((item) => {
    const directItem = item.to
      ? [
          {
            id: item.id,
            labelKey: item.labelKey,
            label: item.label,
            to: item.to,
            end: item.end,
            parentId: null,
            parentLabelKey: null,
            parentLabel: null,
          },
        ]
      : [];

    const childItems =
      item.children?.map((child) => ({
        ...child,
        parentId: item.id,
        parentLabelKey: item.labelKey,
        parentLabel: item.label,
      })) || [];

    return [...directItem, ...childItems];
  });
}

export const searchableSidebarNavigation =
  flattenSearchableNavigation(sidebarNavigation);

export function getSearchableSidebarNavigationForUser(user) {
  return flattenSearchableNavigation(getSidebarNavigationForUser(user));
}

export const sidebarSectionItems = sidebarNavigation.flatMap((item) => {
  const directSectionItem =
    item.workspaceSection && item.to
      ? [
          {
            ...item,
            parentId: null,
            parentLabelKey: null,
            parentLabel: null,
            parentIcon: item.icon,
          },
        ]
      : [];

  const childSectionItems = (item.children || []).map((child) => ({
    ...child,
    parentId: item.id,
    parentLabelKey: item.labelKey,
    parentLabel: item.label,
    parentIcon: item.icon,
  }));

  return [...directSectionItem, ...childSectionItems];
});
