import { Box, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import appLogo from "../../assets/coherent.png";

export function AppLogo({ compact = false }) {
  return (
    <Stack
      component={NavLink}
      to="/"
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ color: "inherit", textDecoration: "none" }}
    >
      <Box
        component="img"
        src={appLogo}
        alt="DMS Portal logo"
        sx={{
          width: compact ? 34 : 42,
          height: compact ? 34 : 42,
          display: "block",
          borderRadius: 3,
          boxShadow: "0 14px 24px rgba(0, 50, 255, 0.28)",
        }}
      />
      {!compact && (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.1 }}
          >
            DMS Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coherent Corp.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
