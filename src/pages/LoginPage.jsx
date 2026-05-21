import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppTextField } from "../components/forms/AppTextField";
import { PasswordField } from "../components/forms/PasswordField";
import { SubmitButton } from "../components/forms/SubmitButton";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { clearAuthError, login, selectAuth } from "../features/auth/authSlice";

const initialForm = {
  username: "",
  password: "",
  loginMode: "ad",
};

export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    }
  }, [auth.isAuthenticated, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (!form.username.trim() || !form.password.trim()) {
      setValidationError(t("auth.validationRequired"));
      return;
    }

    await dispatch(
      login({
        userName: form.username.trim(),
        password: form.password,
        loginMode: form.loginMode,
      }),
    );
  };

  return (
    <AuthLayout
      title={t("auth.loginHeading")}
      description={t("auth.loginDescription")}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: 0,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit}
            sx={{ p: { xs: 3, md: 4.5 } }}
          >
            <Stack spacing={1.25}>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", letterSpacing: "0.16em" }}
              >
                {t("auth.tagline")}
              </Typography>
              <Typography variant="h4">{t("auth.loginTitle")}</Typography>
              <Typography color="text.secondary">
                Authenticate with your Active Directory account using email or
                username
              </Typography>
            </Stack>

            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderLeft: (theme) =>
                  `4px solid ${theme.palette.primary.main}`,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,50,255,0.04)",
              }}
            >
              <Typography variant="subtitle2">
                {t("auth.loginHeading")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("auth.tagline")}
              </Typography>
            </Box>

            {(validationError || auth.error) && (
              <Alert severity="error">{validationError || auth.error}</Alert>
            )}

            <Stack spacing={2}>
              <AppTextField
                required
                label={t("common.username")}
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                autoComplete="username"
              />
              <PasswordField
                required
                label={t("common.password")}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                autoComplete="current-password"
              />
            </Stack>

            <SubmitButton
              loading={auth.status === "loading"}
              fullWidth
              sx={{ minHeight: 52, borderRadius: 0 }}
            >
              {auth.status === "loading"
                ? t("auth.submittingLogin")
                : t("actions.signIn")}
            </SubmitButton>

            <Divider />

            {/* <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
            >
              <Typography color="text.secondary">
                {t("auth.noAccount")}{" "}
                <Link component={RouterLink} underline="hover" to="/register">
                  {t("auth.registerCta")}
                </Link>
              </Typography>
              <Button
                component={RouterLink}
                to="/"
                size="small"
                variant="outlined"
                sx={{
                  alignSelf: { xs: "stretch", sm: "auto" },
                  borderRadius: 0,
                }}
              >
                {t("actions.goHome")}
              </Button>
            </Stack> */}
          </Stack>
        </Box>
      </Box>
    </AuthLayout>
  );
}
