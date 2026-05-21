import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { StatCard } from "../components/layout/StatCard";
import { getHrAdminFeatures } from "../features/hrAdmin/hrAdminCatalog";

export function HrAdminPage() {
  const { t } = useTranslation();
  const features = useMemo(() => getHrAdminFeatures(t), [t]);

  const stats = [
    {
      title: t("hrAdmin.stats.servicesTitle", {
        defaultValue: "Available services",
      }),
      value: String(features.length),
      trend: t("hrAdmin.stats.servicesTrend", {
        defaultValue:
          "Operational HR and admin tools ready for employee self-service.",
      }),
      icon: <AppsRoundedIcon />,
      color: "primary.main",
    },
    {
      title: t("hrAdmin.stats.cutoffTitle", {
        defaultValue: "Nearest cut-off",
      }),
      value: "11:30",
      trend: t("hrAdmin.stats.cutoffTrend", {
        defaultValue:
          "Meal orders and same-day service windows are coordinated from this workspace.",
      }),
      icon: <AccessTimeRoundedIcon />,
      color: "warning.main",
    },
    {
      title: t("hrAdmin.stats.supportTitle", {
        defaultValue: "Support coverage",
      }),
      value: "2h",
      trend: t("hrAdmin.stats.supportTrend", {
        defaultValue:
          "Shared services and HR operations maintain a fast first-response target.",
      }),
      icon: <SupportAgentRoundedIcon />,
      color: "secondary.main",
    },
  ];

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: t("nav.hr_admin") },
        ]}
        title={t("hrAdmin.title", { defaultValue: "HR & Admin" })}
        subtitle={t("hrAdmin.subtitle", {
          defaultValue:
            "Access employee services, administrative workflows, and day-to-day HR operations from one professional workspace.",
        })}
        actions={
          <Chip
            label={t("hrAdmin.badge", {
              defaultValue: "Internal services directory",
            })}
            color="primary"
            variant="outlined"
          />
        }
      />

      {/* <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </Box> */}

      <SectionCard
        title={t("hrAdmin.directoryTitle", {
          defaultValue: "Service Directory",
        })}
        subtitle={t("hrAdmin.directorySubtitle", {
          defaultValue:
            "Choose a service below to continue into the relevant HR or administrative workflow.",
        })}
        action={
          <Button component={Link} to="/dashboard" variant="outlined">
            {t("dashboard.breadcrumbs.root")}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.id}
                sx={{
                  height: "100%",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: "none",
                  transition:
                    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme) => theme.shadows[4],
                    borderColor: feature.accentColor,
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={feature.routePath || `/dashboard/hr-admin/${feature.id}`}
                  sx={{ height: "100%", alignItems: "stretch" }}
                >
                  <CardContent sx={{ p: 3, height: "100%" }}>
                    <Stack spacing={2.5} sx={{ height: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: feature.accentColor,
                            color: "#fff",
                            width: 52,
                            height: 52,
                            flexShrink: 0,
                          }}
                        >
                          <Icon />
                        </Avatar>
                        <Chip
                          label={feature.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            alignSelf: "flex-start",
                            flexShrink: 0,
                            ml: "auto",
                          }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h5">{feature.title}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Chip
                          label={feature.status}
                          size="small"
                          color="primary"
                        />
                        {feature.meta.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box sx={{ mt: "auto", pt: 0.5 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          color="primary.main"
                        >
                          <Typography variant="subtitle2">
                            {t("hrAdmin.openService", {
                              defaultValue: "Open service",
                            })}
                          </Typography>
                          <ArrowForwardRoundedIcon fontSize="small" />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </SectionCard>
    </Stack>
  );
}
