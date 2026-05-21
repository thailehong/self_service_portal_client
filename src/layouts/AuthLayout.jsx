import { Box, Container, Stack, Typography } from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import PhonelinkIcon from "@mui/icons-material/Phonelink";
import { useMemo, useState } from "react";
import { AppLogo } from "../components/common/AppLogo";
import { AppFooter } from "../components/layout/AppFooter";
import { SettingsLauncher } from "../components/layout/SettingsLauncher";
import { SettingsSidebar } from "../components/layout/SettingsSidebar";
import { useTranslation } from "react-i18next";

export function AuthLayout({ title, description, children }) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const foundationItems = useMemo(
    () => [
      {
        title: t("auth.scopeIdentityTitle", {
          defaultValue: "Personal Dashboard",
        }),
        icon: <HowToRegRoundedIcon fontSize="small" />,
      },
      {
        title: t("auth.scopePersonalizationTitle", {
          defaultValue: "Quick access to frequently used services",
        }),
        icon: <DashboardCustomizeRoundedIcon fontSize="small" />,
      },
    ],
    [t],
  );

  const portalFeatures = useMemo(
    () => [
      {
        title: t("auth.scopeDashboardTitle", {
          defaultValue: "Request & Workflow System",
        }),
        icon: <AccountTreeRoundedIcon fontSize="small" />,
      },
      {
        title: t("auth.scopeWorkflowTitle", {
          defaultValue: "Mobile Accessibility",
        }),
        icon: <PhonelinkIcon fontSize="small" />,
      },
      {
        title: t("auth.scopeApprovalTitle", {
          defaultValue: "Global Search Capability",
        }),
        icon: <ManageSearchIcon fontSize="small" />,
      },
    ],
    [t],
  );

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(243,246,251,0.96) 100%), radial-gradient(circle at top left, rgba(0, 50, 255, 0.10), transparent 22%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.10), transparent 28%)",
        "@keyframes authFadeUp": {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes authSweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        "@keyframes authFloat": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "1ms !important",
            animationIterationCount: "1 !important",
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
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <AppLogo />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, lg: 4 },
            alignItems: "stretch",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.08fr) minmax(420px, 0.92fr)",
            },
            flex: 1,
            pb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              p: { xs: 3.5, md: 5 },
              borderRadius: 0,
              color: "#fff",
              background:
                "linear-gradient(155deg, #081426 0%, #0e2852 48%, #12468e 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: "auto", lg: 520 },
              animation: "authFadeUp 620ms ease both",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.11) 46%, transparent 64%)",
                animation: "authSweep 6s ease-in-out infinite",
                pointerEvents: "none",
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: "auto -8% -22% auto",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 68%)",
                pointerEvents: "none",
                animation: "authFloat 5s ease-in-out infinite",
              }}
            />
            <Stack
              spacing={2}
              sx={{
                position: "relative",
                zIndex: 1,
                animation: "authFadeUp 700ms ease 80ms both",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {t("auth.scopeEyebrow", {
                  defaultValue: "Core platform and self-service scope",
                })}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  maxWidth: 760,
                  fontSize: { xs: "2rem", md: "2.45rem" },
                  letterSpacing: 0,
                }}
              >
                Employee Self-Service Portal
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  maxWidth: 620,
                  lineHeight: 1.55,
                }}
              >
                Unified Digital Workplace Portal that enables every employee to
                access information, perform requests, and interact with company
                systems in a simple, personalized, and transparent way across
                web and mobile platforms
              </Typography>
            </Stack>

            <Stack spacing={2} sx={{ mt: 4, position: "relative", zIndex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "1.35rem", md: "1.55rem" },
                  letterSpacing: 0,
                }}
              >
                {t("auth.scopeFoundationTitle", {
                  defaultValue: "Core platform features",
                })}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 560 }}
              >
                {t("auth.scopeFoundationDescription", {
                  defaultValue:
                    "A concise view of the foundation and self-service capabilities delivered through the portal.",
                })}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.25,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                {[...foundationItems, ...portalFeatures].map((item, index) => (
                  <Box
                    key={item.title}
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: "rgba(255,255,255,0.06)",
                      borderLeft: "4px solid rgba(255,255,255,0.35)",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      animation: `authFadeUp 560ms ease ${160 + index * 80}ms both`,
                      transition:
                        "transform 180ms ease, background-color 180ms ease, border-left-color 180ms ease",
                      "&:hover": {
                        transform: "translateX(4px)",
                        bgcolor: "rgba(255,255,255,0.1)",
                        borderLeftColor: "#fff",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2">
                          {item.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              width: "100%",
              minWidth: 0,
            }}
          >
            {children}
          </Box>
        </Box>
      </Container>
      <AppFooter />
      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}
