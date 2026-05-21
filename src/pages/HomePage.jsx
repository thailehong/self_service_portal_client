import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import MobileFriendlyRoundedIcon from "@mui/icons-material/MobileFriendlyRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppFooter } from "../components/layout/AppFooter";
import { SettingsLauncher } from "../components/layout/SettingsLauncher";
import { SettingsSidebar } from "../components/layout/SettingsSidebar";
import { AppLogo } from "../components/common/AppLogo";
import { selectAuth } from "../features/auth/authSlice";
import { useAppSelector } from "../hooks/useAppSelector";
import coherentImage from "../assets/coherent.png";

const surfaceSx = {
  borderRadius: 1,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "none",
  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
    borderColor: "rgba(0, 50, 255, 0.18)",
  },
};

function MetricCard({ value, label, helper, color, delay = 0 }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: "100%",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 1,
        bgcolor: "#fff",
        p: 2.25,
        animation: `portalFadeUp 560ms ease ${delay}ms both`,
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: 3,
          bgcolor: color,
          transform: "scaleX(0.34)",
          transformOrigin: "left",
          transition: "transform 260ms ease",
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.1)",
          borderColor: color,
          "&::before": {
            transform: "scaleX(1)",
          },
        },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color,
          lineHeight: 1.1,
          letterSpacing: 0,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {helper}
      </Typography>
    </Box>
  );
}

function PrincipleItem({ icon, title, description }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        borderRadius: 1,
        p: 0.5,
        transition: "background-color 180ms ease",
        "&:hover": {
          bgcolor: "rgba(0, 50, 255, 0.04)",
          "& .principle-icon": {
            transform: "translateY(-2px) rotate(-3deg)",
            bgcolor: "rgba(0, 50, 255, 0.12)",
          },
        },
      }}
    >
      <Box
        className="principle-icon"
        sx={{
          width: 38,
          height: 38,
          borderRadius: 1,
          display: "grid",
          flexShrink: 0,
        placeItems: "center",
        color: "primary.main",
        bgcolor: "rgba(0, 50, 255, 0.08)",
        transition: "transform 180ms ease, background-color 180ms ease",
      }}
    >
      {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function AudiencePanel({ title, description, items, color, icon, delay = 0 }) {
  return (
    <Card
      sx={{
        ...surfaceSx,
        height: "100%",
        animation: `portalFadeUp 560ms ease ${delay}ms both`,
      }}
    >
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Stack spacing={2.25} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                bgcolor: color,
                flexShrink: 0,
                transition: "transform 220ms ease",
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25} sx={{ flex: 1 }}>
            {items.map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                <FactCheckRoundedIcon sx={{ color, fontSize: 18, mt: 0.25 }} />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const auth = useAppSelector(selectAuth);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const visionPillars = useMemo(
    () => [
      {
        title: t("home.visionPillarSingleEntryTitle", {
          defaultValue: "Single entry point",
        }),
        description: t("home.visionPillarSingleEntryDescription", {
          defaultValue:
            "One unified access point for internal services, replacing fragmented email, Excel, and paper-based processes.",
        }),
        icon: <HubRoundedIcon fontSize="small" />,
        color: "#0032ff",
      },
      {
        title: t("home.visionPillarPersonalizedTitle", {
          defaultValue: "Personalized experience",
        }),
        description: t("home.visionPillarPersonalizedDescription", {
          defaultValue:
            "Employees see relevant information and functions by role, department, BU, site, location, and work context.",
        }),
        icon: <DashboardCustomizeRoundedIcon fontSize="small" />,
        color: "#0f9f6e",
      },
      {
        title: t("home.visionPillarWorkflowTitle", {
          defaultValue: "Service and workflow driven",
        }),
        description: t("home.visionPillarWorkflowDescription", {
          defaultValue:
            "Internal services are standardized into workflows with full request visibility, tracking, logs, and history.",
        }),
        icon: <AccountTreeRoundedIcon fontSize="small" />,
        color: "#d97706",
      },
      {
        title: t("home.visionPillarIntegrationTitle", {
          defaultValue: "Integration hub",
        }),
        description: t("home.visionPillarIntegrationDescription", {
          defaultValue:
            "A central layer connecting ERP, MES, production, HR, and future enterprise applications without disrupting them.",
        }),
        icon: <IntegrationInstructionsRoundedIcon fontSize="small" />,
        color: "#7c3aed",
      },
    ],
    [t],
  );

  const principles = useMemo(
    () => [
      {
        title: t("home.principleUserFirstTitle", {
          defaultValue: "User-first, not system-first",
        }),
        description: t("home.principleUserFirstDescription", {
          defaultValue: "Design around employee needs instead of system structure.",
        }),
        icon: <Diversity3RoundedIcon fontSize="small" />,
      },
      {
        title: t("home.principleSearchTitle", {
          defaultValue: "Search-driven, not menu-driven",
        }),
        description: t("home.principleSearchDescription", {
          defaultValue: "Help users find information quickly without navigating complex menus.",
        }),
        icon: <ManageSearchRoundedIcon fontSize="small" />,
      },
      {
        title: t("home.principleConfigTitle", {
          defaultValue: "Configuration over customization",
        }),
        description: t("home.principleConfigDescription", {
          defaultValue: "Prefer metadata and workflow configuration instead of hard-coded module behavior.",
        }),
        icon: <TuneRoundedIcon fontSize="small" />,
      },
      {
        title: t("home.principleMobileTitle", {
          defaultValue: "Mobile-first mindset",
        }),
        description: t("home.principleMobileDescription", {
          defaultValue: "Optimize core journeys for workers and mobile usage.",
        }),
        icon: <MobileFriendlyRoundedIcon fontSize="small" />,
      },
      {
        title: t("home.principleRoleTitle", {
          defaultValue: "Role-based everything",
        }),
        description: t("home.principleRoleDescription", {
          defaultValue: "Control UI, data, services, and approvals dynamically by role.",
        }),
        icon: <VerifiedUserRoundedIcon fontSize="small" />,
      },
    ],
    [t],
  );

  const audiences = useMemo(
    () => [
      {
        title: t("home.audienceEmployeesTitle", {
          defaultValue: "Employees",
        }),
        description: t("home.audienceEmployeesDescription", {
          defaultValue: "Workers and staff complete daily requests from one place.",
        }),
        items: [
          t("home.audienceEmployeesItemMeals", {
            defaultValue: "Request meals and transportation",
          }),
          t("home.audienceEmployeesItemRequests", {
            defaultValue: "Submit OT, resign, and internal service requests",
          }),
          t("home.audienceEmployeesItemProfile", {
            defaultValue: "Access personal information without switching systems",
          }),
        ],
        color: "#0032ff",
        icon: <Groups2RoundedIcon />,
      },
      {
        title: t("home.audienceManagersTitle", {
          defaultValue: "Supervisors and managers",
        }),
        description: t("home.audienceManagersDescription", {
          defaultValue: "Leaders approve, monitor, and act on operational data.",
        }),
        items: [
          t("home.audienceManagersItemApprove", {
            defaultValue: "Approve requests from standardized workflows",
          }),
          t("home.audienceManagersItemTeam", {
            defaultValue: "Monitor team activity and request status",
          }),
          t("home.audienceManagersItemKpi", {
            defaultValue: "Access operational data and KPIs",
          }),
        ],
        color: "#0f9f6e",
        icon: <ApprovalRoundedIcon />,
      },
      {
        title: t("home.audienceExecutivesTitle", {
          defaultValue: "Executives",
        }),
        description: t("home.audienceExecutivesDescription", {
          defaultValue: "Executives get visibility for decisions and transformation.",
        }),
        items: [
          t("home.audienceExecutivesItemDashboard", {
            defaultValue: "Access high-level dashboards",
          }),
          t("home.audienceExecutivesItemRealtime", {
            defaultValue: "Review real-time insights",
          }),
          t("home.audienceExecutivesItemDecision", {
            defaultValue: "Use decision-support data across sites and BUs",
          }),
        ],
        color: "#d97706",
        icon: <InsightsRoundedIcon />,
      },
    ],
    [t],
  );

  const successMetrics = useMemo(
    () => [
      {
        value: "70%+",
        label: t("home.metricAdoptionLabel", {
          defaultValue: "employee adoption",
        }),
        helper: t("home.metricAdoptionHelper", {
          defaultValue: "Within the first 3 months after launch.",
        }),
        color: "#0032ff",
      },
      {
        value: "90%+",
        label: t("home.metricRequestsLabel", {
          defaultValue: "requests via portal",
        }),
        helper: t("home.metricRequestsHelper", {
          defaultValue: "No email or paper for standard internal requests.",
        }),
        color: "#0f9f6e",
      },
      {
        value: "50%+",
        label: t("home.metricProcessingLabel", {
          defaultValue: "faster processing",
        }),
        helper: t("home.metricProcessingHelper", {
          defaultValue: "Reduction in request processing time.",
        }),
        color: "#d97706",
      },
      {
        value: "100%",
        label: t("home.metricTraceabilityLabel", {
          defaultValue: "trackable requests",
        }),
        helper: t("home.metricTraceabilityHelper", {
          defaultValue: "Statuses, approvals, logs, and history are visible.",
        }),
        color: "#7c3aed",
      },
      {
        value: "2-5 days",
        label: t("home.metricModuleLabel", {
          defaultValue: "to onboard a module",
        }),
        helper: t("home.metricModuleHelper", {
          defaultValue: "New modules added through metadata and workflow configuration.",
        }),
        color: "#0284c7",
      },
      {
        value: "< 10 sec",
        label: t("home.metricSearchLabel", {
          defaultValue: "information retrieval",
        }),
        helper: t("home.metricSearchHelper", {
          defaultValue: "Search-first access to the information employees need.",
        }),
        color: "#dc2626",
      },
    ],
    [t],
  );

  const technicalTargets = useMemo(
    () => [
      {
        label: t("home.technicalUptimeLabel", {
          defaultValue: "System uptime",
        }),
        value: "99%+",
      },
      {
        label: t("home.technicalResponseLabel", {
          defaultValue: "Key action response time",
        }),
        value: "< 2-3 sec",
      },
      {
        label: t("home.technicalMobileLabel", {
          defaultValue: "Mobile feature access",
        }),
        value: "80%+",
      },
      {
        label: t("home.technicalRequestTimeLabel", {
          defaultValue: "Average request completion",
        }),
        value: "< 1-2 min",
      },
    ],
    [t],
  );

  const nonGoals = useMemo(
    () => [
      t("home.nonGoalReplaceSystems", {
        defaultValue: "Replace full DMS, MES, or ERP systems",
      }),
      t("home.nonGoalRebuildModules", {
        defaultValue: "Rebuild all operational modules from scratch",
      }),
      t("home.nonGoalSpecialized", {
        defaultValue: "Become a deeply specialized system for each domain",
      }),
    ],
    [t],
  );

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: "#f3f6fb",
        background:
          "linear-gradient(180deg, #f7faff 0%, #ffffff 30%, #f4f7fb 100%)",
        "@keyframes portalFadeUp": {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes portalFloat": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "@keyframes portalSweep": {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(110%)" },
        },
        "@keyframes portalPulseLine": {
          "0%, 100%": { opacity: 0.35 },
          "50%": { opacity: 0.85 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "1ms !important",
            animationIterationCount: "1 !important",
            scrollBehavior: "auto !important",
            transitionDuration: "1ms !important",
          },
        },
      }}
    >
      <SettingsLauncher
        onClick={() => setSettingsOpen(true)}
        sx={{
          position: "absolute",
          top: { xs: 16, md: 24 },
          right: { xs: 16, md: 32 },
          zIndex: 2,
        }}
      />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 4, md: 5 } }}
        >
          <AppLogo />
        </Stack>

        <Stack spacing={{ xs: 4, md: 5 }}>
          <Box
            sx={{
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              bgcolor: "#fff",
              animation: "portalFadeUp 640ms ease both",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1.08fr 0.92fr" },
                minHeight: { xs: "auto", lg: 560 },
              }}
            >
                <Stack spacing={3} justifyContent="space-between" sx={{ p: { xs: 3, md: 5, xl: 6 } }}>
                <Stack spacing={2.5} sx={{ animation: "portalFadeUp 700ms ease 80ms both" }}>
                  <Chip
                    label={t("home.eyebrow", {
                      defaultValue: "Product vision and success criteria",
                    })}
                    color="primary"
                    sx={{ alignSelf: "flex-start", fontWeight: 800 }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      maxWidth: 780,
                      letterSpacing: 0,
                      fontSize: { xs: "2.25rem", md: "3.1rem" },
                      lineHeight: 1.08,
                    }}
                  >
                    {t("home.heroTitle", {
                      defaultValue: "Unified Digital Workplace Portal",
                    })}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.7 }}>
                    {t("home.heroDescription", {
                      defaultValue:
                        "Enable every employee to access information, perform requests, and interact with company systems in a simple, personalized, and transparent way across web and mobile platforms.",
                    })}
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={auth.isAuthenticated ? "/dashboard" : "/login"}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 14px 26px rgba(0, 50, 255, 0.22)",
                      },
                    }}
                  >
                    {auth.isAuthenticated
                      ? t("home.openWorkspaceAction", {
                          defaultValue: "Open workspace",
                        })
                      : t("actions.signIn")}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/dashboard/hr-admin"
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      transition: "transform 180ms ease, background-color 180ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {t("home.exploreServicesAction", {
                      defaultValue: "Explore services",
                    })}
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 360, lg: "100%" },
                  bgcolor: "#0f172a",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.14) 45%, transparent 62%)",
                    animation: "portalSweep 5.5s ease-in-out infinite",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "42px 42px",
                    maskImage: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent 88%)",
                    animation: "portalPulseLine 4.5s ease-in-out infinite",
                  },
                }}
              >
                <Box
                  component="img"
                  src={coherentImage}
                  alt="Coherent employee portal"
                  sx={{
                    position: "absolute",
                    right: { xs: 24, md: 42 },
                    top: { xs: 24, md: 42 },
                    width: { xs: 92, md: 124 },
                    height: { xs: 92, md: 124 },
                    objectFit: "contain",
                    borderRadius: 4,
                    boxShadow: "0 24px 50px rgba(0, 0, 0, 0.26)",
                    bgcolor: "#fff",
                    zIndex: 1,
                    animation: "portalFloat 4.8s ease-in-out infinite",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    inset: { xs: "148px 20px 22px", md: "184px 40px 40px" },
                    display: "grid",
                    gridTemplateRows: "auto 1fr",
                    gap: 2,
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ color: "#fff" }}>
                    <Typography variant="overline" sx={{ letterSpacing: 0, opacity: 0.72 }}>
                      {t("home.operatingModelLabel", {
                        defaultValue: "Portal role",
                      })}
                    </Typography>
                    <Typography variant="h4" sx={{ letterSpacing: 0, maxWidth: 440 }}>
                      {t("home.operatingModelTitle", {
                        defaultValue: "Access, integrate, orchestrate, and deliver one employee experience.",
                      })}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      alignSelf: "end",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    {[
                      t("home.operatingModelAccess", { defaultValue: "Provide access" }),
                      t("home.operatingModelIntegrate", { defaultValue: "Integrate systems" }),
                      t("home.operatingModelOrchestrate", { defaultValue: "Orchestrate workflows" }),
                      t("home.operatingModelExperience", { defaultValue: "Deliver unified UX" }),
                    ].map((item, index) => (
                      <Box
                        key={item}
                        sx={{
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                          borderRadius: 1,
                          p: 1.75,
                          animation: `portalFadeUp 560ms ease ${220 + index * 80}ms both`,
                          transition: "transform 180ms ease, background-color 180ms ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            bgcolor: "rgba(255, 255, 255, 0.13)",
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "#fff" }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {visionPillars.map((pillar, index) => (
              <Card
                key={pillar.title}
                sx={{
                  ...surfaceSx,
                  height: "100%",
                  animation: `portalFadeUp 560ms ease ${index * 90}ms both`,
                }}
              >
                <CardContent sx={{ p: 3, height: "100%" }}>
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        bgcolor: pillar.color,
                        transition: "transform 220ms ease",
                      }}
                    >
                      {pillar.icon}
                    </Box>
                    <Typography variant="h6">{pillar.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pillar.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", lg: "0.95fr 1.05fr" },
              alignItems: "stretch",
            }}
          >
            <Card sx={{ ...surfaceSx, height: "100%" }}>
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: "100%" }}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <RuleRoundedIcon color="primary" />
                    <Typography variant="h4" sx={{ letterSpacing: 0 }}>
                      {t("home.principlesTitle", {
                        defaultValue: "Core design principles",
                      })}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    {t("home.principlesDescription", {
                      defaultValue:
                        "The portal should feel simple for employees while staying configurable, decoupled, mobile-ready, and role-aware behind the scenes.",
                    })}
                  </Typography>
                  <Divider />
                  <Stack spacing={2}>
                    {principles.map((principle) => (
                      <PrincipleItem key={principle.title} {...principle} />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                  {t("home.goalsEyebrow", {
                    defaultValue: "Product goals",
                  })}
                </Typography>
                <Typography variant="h4" sx={{ letterSpacing: 0 }}>
                  {t("home.goalsTitle", {
                    defaultValue: "Standardize processes, improve efficiency, and create the foundation for digital transformation.",
                  })}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" },
                }}
              >
                {audiences.map((audience, index) => (
                  <AudiencePanel key={audience.title} {...audience} delay={index * 90} />
                ))}
              </Box>
            </Stack>
          </Box>

          <Card sx={surfaceSx}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box sx={{ maxWidth: 720 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                      {t("home.successEyebrow", {
                        defaultValue: "Success criteria",
                      })}
                    </Typography>
                    <Typography variant="h4" sx={{ letterSpacing: 0 }}>
                      {t("home.successTitle", {
                        defaultValue: "Measurable adoption, efficiency, transparency, scalability, experience, and performance targets.",
                      })}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<PublishedWithChangesRoundedIcon />}
                    label={t("home.successStatus", {
                      defaultValue: "To discuss with team",
                    })}
                    color="warning"
                    variant="outlined"
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      xl: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  {successMetrics.map((metric, index) => (
                    <MetricCard key={metric.label} {...metric} delay={index * 70} />
                  ))}
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(4, minmax(0, 1fr))",
                    },
                  }}
                >
                  {technicalTargets.map((target, index) => (
                    <Stack
                      key={target.label}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        borderRadius: 1,
                        border: "1px dashed rgba(15, 23, 42, 0.16)",
                        p: 2,
                        animation: `portalFadeUp 520ms ease ${index * 70}ms both`,
                        transition: "transform 180ms ease, border-color 180ms ease, background-color 180ms ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          borderColor: "primary.main",
                          bgcolor: "rgba(0, 50, 255, 0.03)",
                        },
                      }}
                    >
                      <SpeedRoundedIcon color="primary" />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1">{target.value}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {target.label}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", lg: "0.95fr 1.05fr" },
            }}
          >
            <Card sx={{ ...surfaceSx, bgcolor: "#fffaf0" }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2.25}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WarningAmberRoundedIcon color="warning" />
                    <Typography variant="h4" sx={{ letterSpacing: 0 }}>
                      {t("home.nonGoalsTitle", {
                        defaultValue: "Non-goals and scope control",
                      })}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    {t("home.nonGoalsDescription", {
                      defaultValue:
                        "The portal coordinates employee journeys. It should not replace enterprise systems or become a deeply specialized application for every domain.",
                    })}
                  </Typography>
                  <Stack spacing={1.25}>
                    {nonGoals.map((item) => (
                      <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                        <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 18, mt: 0.25 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ ...surfaceSx, bgcolor: "#f8fbff" }}>
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: "100%" }}>
                <Stack spacing={2.5} justifyContent="space-between" sx={{ height: "100%" }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <FactCheckRoundedIcon color="success" />
                      <Typography variant="h4" sx={{ letterSpacing: 0 }}>
                        {t("home.definitionTitle", {
                          defaultValue: "Definition of success",
                        })}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {t("home.definitionDescription", {
                        defaultValue:
                          "The system is successful when employees no longer rely on email, Excel, or paper for internal processes, and can find, request, track, and manage everything through a single platform.",
                      })}
                    </Typography>
                  </Stack>

                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                  >
                    {t("home.goToDashboardAction", {
                      defaultValue: "Go to dashboard",
                    })}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      <AppFooter />
      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
