import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { applicationRegistry } from "../app/appRegistry";
import { portalFavoritesApi } from "../services/api/portalFavoritesApi";
import { getErrorMessage } from "./workflow/workflowUtils";

const selfServiceApplicationIds = ["eworkflow", "order_meal", "booking_bus"];
const appIconColors = [
  "primary.main",
  "success.main",
  "warning.main",
  "secondary.main",
  "info.main",
  "error.main",
  "text.secondary",
];

export function SelfServicePage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteError, setFavoriteError] = useState("");
  const [savingFavoriteIds, setSavingFavoriteIds] = useState([]);
  const applications = applicationRegistry.filter((application) =>
    selfServiceApplicationIds.includes(application.id),
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setFavoriteError("");
      try {
        const favorites = await portalFavoritesApi.getFavorites();
        if (!cancelled) {
          setFavoriteIds(favorites);
        }
      } catch (error) {
        if (!cancelled) {
          setFavoriteError(
            getErrorMessage(error, "Could not load favorite applications."),
          );
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleFavorite = async (application) => {
    const isFavorite = favoriteIdSet.has(application.id);
    setFavoriteError("");
    setSavingFavoriteIds((current) => [...current, application.id]);

    try {
      if (isFavorite) {
        await portalFavoritesApi.removeFavorite(application.id);
        setFavoriteIds((current) =>
          current.filter((applicationId) => applicationId !== application.id),
        );
      } else {
        await portalFavoritesApi.addFavorite(application.id);
        setFavoriteIds((current) =>
          current.includes(application.id)
            ? current
            : [...current, application.id],
        );
      }
    } catch (error) {
      setFavoriteError(
        getErrorMessage(error, "Could not update favorite applications."),
      );
    } finally {
      setSavingFavoriteIds((current) =>
        current.filter((applicationId) => applicationId !== application.id),
      );
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Self Service" },
        ]}
      />

      {favoriteError ? <Alert severity="warning">{favoriteError}</Alert> : null}

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
            lg: "repeat(6, minmax(0, 1fr))",
          },
          justifyItems: "center",
        }}
      >
        {applications.map((application, index) => {
          const Icon = application.icon;
          const isFavorite = favoriteIdSet.has(application.id);
          const saving = savingFavoriteIds.includes(application.id);

          return (
            <Box
              key={application.id}
              component="button"
              type="button"
              onClick={() => navigate(application.to)}
              sx={{
                width: "80%",
                aspectRatio: "1 / 1",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: "background.paper",
                color: "text.primary",
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                textAlign: "center",
                position: "relative",
                cursor: "pointer",
                transition: "border-color 150ms ease, background-color 150ms ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box
                sx={{
                  color: appIconColors[index % appIconColors.length],
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon fontSize="large" />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  width: "100%",
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  lineHeight: 1.25,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {application.label}
              </Typography>
              <Tooltip title={isFavorite ? "Remove favorite" : "Add favorite"}>
                <span>
                  <IconButton
                    size="small"
                    disabled={saving}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleToggleFavorite(application);
                    }}
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {isFavorite ? (
                      <StarRoundedIcon fontSize="small" color="warning" />
                    ) : (
                      <StarBorderRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
