import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export function MaintenancePage({
  loading = false,
  error = "",
  title = "DMS Portal is under maintenance",
  message = "The portal is temporarily unavailable. Please try again later.",
  onRetry,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          textAlign: "center",
        }}
      >
        <Stack
          spacing={3}
          alignItems="center"
          sx={{ width: "100%", textAlign: "center" }}
        >
          <Box
            sx={{
              width: "100%",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "transparent",
            }}
          >
            {loading ? (
              <CircularProgress size={30} />
            ) : (
              <ConstructionRoundedIcon
                sx={{ fontSize: 42, display: "block" }}
              />
            )}
          </Box>

          <Stack
            spacing={1}
            alignItems="center"
            sx={{
              width: "100%",
              maxWidth: 460,
              mx: "auto",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{ width: "100%", mx: "auto", display: "block" }}
            >
              {loading ? "Checking portal status" : title}
            </Typography>
            <Typography
              color="text.secondary"
              align="center"
              sx={{ width: "100%", mx: "auto", display: "block" }}
            >
              {loading
                ? "Please wait while DMS Portal checks current availability."
                : message}
            </Typography>
          </Stack>

          {error ? (
            <Alert severity="warning" sx={{ width: "100%", textAlign: "left" }}>
              {error}
            </Alert>
          ) : null}

          {onRetry ? (
            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <RefreshRoundedIcon />
                )
              }
              onClick={onRetry}
              disabled={loading}
            >
              Refresh
            </Button>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
