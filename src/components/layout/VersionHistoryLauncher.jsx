import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { APP_VERSION, APP_VERSION_HISTORY } from "../../app/appMeta";

export function VersionHistoryLauncher({ collapsed = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const button = (
    <ListItemButton
      onClick={() => setOpen(true)}
      sx={{
        minHeight: 32,
        // px: collapsed ? 1.25 : 1.5,
        borderRadius: 3,
        justifyContent: collapsed ? "center" : "flex-start",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 38,
          color: "text.secondary",
          justifyContent: "center",
        }}
      >
        <HistoryRoundedIcon />
      </ListItemIcon>

      {!collapsed ? (
        <ListItemText
          primary={t("footer.version", {
            defaultValue: `Version ${APP_VERSION}`,
          })}
          slotProps={{
            primary: {
              variant: "body2",
              fontWeight: 600,
              noWrap: true,
              mt: 0.3,
            },
          }}
        />
      ) : null}
    </ListItemButton>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip
          title={t("footer.versionTooltip", {
            defaultValue: `Version ${APP_VERSION} - Open history`,
          })}
          placement="right"
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack spacing={0.75}>
            <Typography variant="h5">
              {t("footer.versionHistoryTitle", {
                defaultValue: "Version history",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("footer.versionHistorySubtitle", {
                defaultValue: "What's new",
              })}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {APP_VERSION_HISTORY.map((release, index) => (
              <Box key={release.version}>
                <Stack spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">
                      {t("footer.versionHistoryItemTitle", {
                        defaultValue: "Version {{version}}",
                        version: release.version,
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {release.releaseDate}
                    </Typography>
                  </Stack>

                  <Stack spacing={1.25}>
                    {release.items.map((item, itemIndex) => (
                      <Stack
                        key={`${release.version}-${item.title}`}
                        direction="row"
                        spacing={1.25}
                        alignItems="flex-start"
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minWidth: 20 }}
                        >
                          {itemIndex + 1}.
                        </Typography>
                        <Box>
                          <Typography variant="subtitle1">
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                {index !== APP_VERSION_HISTORY.length - 1 ? (
                  <Divider sx={{ mt: 3 }} />
                ) : null}
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
