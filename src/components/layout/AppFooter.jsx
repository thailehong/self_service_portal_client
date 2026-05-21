import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function AppFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          {t("footer.copyright", {
            defaultValue: `Copyright \u00A9 ${currentYear}. Coherent Vietnam IT Team.`,
          })}
        </Typography>
      </Box>
    </Box>
  );
}
