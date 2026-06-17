import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded";
import {
  applicationRegistry,
  canDisplayApplication,
  externalApplicationGroups,
} from "./appRegistry";

const primaryNavigationApplicationIds = [
  "dashboard",
  "self_service",
];

export const sidebarNavigation = [
  ...applicationRegistry
    .filter((application) =>
      primaryNavigationApplicationIds.includes(application.id),
    )
    .map((application) => ({
      ...application,
      ...(application.id === "dashboard" ? { labelKey: "nav.dashboard" } : {}),
    })),
  ...externalApplicationGroups.map((group) => ({
    ...group,
    type: "internal",
    end: true,
  })),
  ...applicationRegistry
    .filter((application) => application.id === "administrator")
    .map((application) => ({ ...application })),
  {
    id: "help",
    labelKey: "nav.help",
    icon: HelpCenterRoundedIcon,
    children: [
      {
        id: "help-center",
        labelKey: "navChildren.helpCenter",
        label: "Help Center",
        to: "/dashboard/help/center",
        end: true,
        type: "internal",
        icon: HelpCenterRoundedIcon,
        meta: {
          metricValues: ["24", "8", "1d"],
          accentColor: "secondary.main",
        },
      },
    ],
  },
];

function canDisplayNavigationItem(item, user) {
  return canDisplayApplication(item, user);
}

export function getSidebarNavigationForUser(user) {
  return sidebarNavigation
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) =>
        canDisplayNavigationItem(child, user),
      ),
    }))
    .filter(
      (item) =>
        canDisplayNavigationItem(item, user)
        && (!item.children || item.children.length > 0),
    );
}

export function getNavigationLabel(item, t) {
  return item.labelKey ? t(item.labelKey) : item.label;
}

function flattenSearchableNavigation(navigationItems) {
  return navigationItems.flatMap((item) => {
    const directItem = item.to || item.href
      ? [
          {
            id: item.id,
            labelKey: item.labelKey,
            label: item.label,
            to: item.to,
            href: item.href,
            type: item.type,
            icon: item.icon,
            end: item.end,
            parentId: null,
            parentLabelKey: null,
            parentLabel: null,
            parentIcon: null,
          },
        ]
      : [];

    const childItems =
      item.children?.map((child) => ({
        ...child,
        parentId: item.id,
        parentLabelKey: item.labelKey,
        parentLabel: item.label,
        parentIcon: item.icon,
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
