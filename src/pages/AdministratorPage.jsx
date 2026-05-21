import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { useNotifier } from "../hooks/useNotifier";
import { roleApi } from "../services/api/roleApi";
import { userApi } from "../services/api/userApi";

const initialRoleForm = {
  name: "",
  site: "",
  bu: "",
  department: "",
};

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback
  );
}

function formatRoleScope(role) {
  return [role.site, role.bu, role.department].filter(Boolean).join(" / ");
}

function formatRoleLabel(role) {
  const scope = formatRoleScope(role);
  return scope ? `${role.roleName} - ${scope}` : role.roleName;
}

function getCreatedUserLabel(user, fallbackEmployeeId) {
  if (!user || typeof user !== "object") {
    return fallbackEmployeeId;
  }

  return (
    user.username ||
    user.Username ||
    user.userName ||
    user.UserName ||
    user.employeeID ||
    user.EmployeeID ||
    fallbackEmployeeId
  );
}

export function AdministratorPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAssignment, setLastAssignment] = useState(null);
  const [roleForm, setRoleForm] = useState(initialRoleForm);
  const [roleCreateError, setRoleCreateError] = useState("");
  const [roleCreating, setRoleCreating] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [userCreateError, setUserCreateError] = useState("");
  const [userCreating, setUserCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds],
  );

  const loadRoles = async () => {
    setRolesLoading(true);
    setRolesError("");

    try {
      const nextRoles = await roleApi.getRoles();
      setRoles(nextRoles);
      setSelectedRoleIds((current) =>
        current.filter((roleId) =>
          nextRoles.some((role) => String(role.id) === String(roleId)),
        ),
      );
    } catch (error) {
      setRolesError(getErrorMessage(error, "Could not load roles."));
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleAssignRoles = async (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername || selectedRoleIds.length === 0) {
      setSubmitError("Enter a username and select at least one role.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await roleApi.assignUserRoles({
        username: trimmedUsername,
        roleIds: selectedRoleIds,
      });
      setLastAssignment({
        username: trimmedUsername,
        roles: selectedRoles,
      });
      notify({
        message: `Roles updated for ${trimmedUsername}.`,
        severity: "success",
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not assign roles."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    const nextRole = {
      name: roleForm.name.trim(),
      site: roleForm.site.trim(),
      bu: roleForm.bu.trim(),
      department: roleForm.department.trim(),
    };

    if (!nextRole.name || !nextRole.site || !nextRole.bu || !nextRole.department) {
      setRoleCreateError("Name, Site, BU, and Department are required.");
      return;
    }

    setRoleCreating(true);
    setRoleCreateError("");

    try {
      const createdRole = await roleApi.createRole(nextRole);
      setRoles((current) => [...current, createdRole]);
      setRoleForm(initialRoleForm);
      notify({
        message: `Role ${createdRole.roleName} created.`,
        severity: "success",
      });
      await loadRoles();
    } catch (error) {
      setRoleCreateError(getErrorMessage(error, "Could not create role."));
    } finally {
      setRoleCreating(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    const trimmedEmployeeId = employeeId.trim();

    if (!trimmedEmployeeId) {
      setUserCreateError("Employee ID is required.");
      return;
    }

    setUserCreating(true);
    setUserCreateError("");

    try {
      const nextUser = await userApi.createUserByEmployeeId(trimmedEmployeeId);
      setCreatedUser({ employeeId: trimmedEmployeeId, data: nextUser });
      setEmployeeId("");
      notify({
        message: `User created for Employee ID ${trimmedEmployeeId}.`,
        severity: "success",
      });
    } catch (error) {
      setUserCreateError(getErrorMessage(error, "Could not create user."));
    } finally {
      setUserCreating(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: "Administrator" },
        ]}
        title="Administrator"
        subtitle="Manage system-wide users, roles, and permission assignments."
        actions={
          <Chip
            label="Access control"
            color="primary"
            variant="outlined"
            icon={<SecurityRoundedIcon />}
          />
        }
      />

      <SectionCard
        title="Role management"
        subtitle="Assign permissions, create scoped roles, and review every role currently available in the system."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadRoles}
            disabled={rolesLoading || submitting || roleCreating}
          >
            Refresh roles
          </Button>
        }
      >
        <Stack spacing={3}>
          {rolesError ? (
            <Alert severity="error" variant="outlined">
              {rolesError}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", xl: "1.05fr 0.95fr" },
              alignItems: "start",
            }}
          >
            <Stack component="form" spacing={2.25} onSubmit={handleAssignRoles}>
              <Stack spacing={0.5}>
                <Typography variant="h6">Assign permissions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Grant one or more scoped roles to a portal username.
                </Typography>
              </Stack>

              {submitError ? (
                <Alert severity="error" variant="outlined">
                  {submitError}
                </Alert>
              ) : null}
              {lastAssignment ? (
                <Alert severity="success" variant="outlined">
                  Updated {lastAssignment.username} with{" "}
                  {lastAssignment.roles.length} role
                  {lastAssignment.roles.length === 1 ? "" : "s"}.
                </Alert>
              ) : null}

              <TextField
                label={t("common.username")}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                fullWidth
                required
                disabled={submitting}
              />

              <Autocomplete
                multiple
                disableCloseOnSelect
                loading={rolesLoading}
                options={roles}
                value={selectedRoles}
                onChange={(_, value) =>
                  setSelectedRoleIds(value.map((role) => role.id))
                }
                getOptionLabel={formatRoleLabel}
                isOptionEqualToValue={(option, value) =>
                  String(option.id) === String(value.id)
                }
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  const scope = formatRoleScope(option);

                  return (
                    <Box component="li" key={key} {...optionProps}>
                      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Typography variant="body2">{option.roleName}</Typography>
                        {scope ? (
                          <Typography variant="caption" color="text.secondary">
                            {scope}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Roles"
                    required={selectedRoleIds.length === 0}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });

                    return (
                      <Chip
                        key={key}
                        label={formatRoleLabel(option)}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
                disabled={rolesLoading || submitting}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Typography variant="body2" color="text.secondary">
                  {selectedRoleIds.length} role
                  {selectedRoleIds.length === 1 ? "" : "s"} selected
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    submitting ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <SaveRoundedIcon />
                    )
                  }
                  disabled={submitting || rolesLoading}
                >
                  Save assignment
                </Button>
              </Stack>
            </Stack>

            <Stack component="form" spacing={2.25} onSubmit={handleCreateRole}>
              <Stack spacing={0.5}>
                <Typography variant="h6">Create role</Typography>
                <Typography variant="body2" color="text.secondary">
                  Define a reusable permission scope by name, site, BU, and department.
                </Typography>
              </Stack>

              {roleCreateError ? (
                <Alert severity="error" variant="outlined">
                  {roleCreateError}
                </Alert>
              ) : null}

              <TextField
                label="Name"
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                fullWidth
                disabled={roleCreating}
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                }}
              >
                <TextField
                  label="Site"
                  value={roleForm.site}
                  onChange={(event) =>
                    setRoleForm((current) => ({
                      ...current,
                      site: event.target.value,
                    }))
                  }
                  required
                  disabled={roleCreating}
                />
                <TextField
                  label="BU"
                  value={roleForm.bu}
                  onChange={(event) =>
                    setRoleForm((current) => ({
                      ...current,
                      bu: event.target.value,
                    }))
                  }
                  required
                  disabled={roleCreating}
                />
                <TextField
                  label="Department"
                  value={roleForm.department}
                  onChange={(event) =>
                    setRoleForm((current) => ({
                      ...current,
                      department: event.target.value,
                    }))
                  }
                  required
                  disabled={roleCreating}
                />
              </Box>

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    roleCreating ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <AddCircleOutlineRoundedIcon />
                    )
                  }
                  disabled={roleCreating || rolesLoading}
                >
                  Create role
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">Available roles</Typography>
                <Typography variant="body2" color="text.secondary">
                  Full role definitions returned by the Roles API.
                </Typography>
              </Stack>
              <Chip
                label={`${roles.length} total`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            {rolesLoading ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={22} />
                <Typography color="text.secondary">Loading roles...</Typography>
              </Stack>
            ) : roles.length ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: "1fr",
                }}
              >
                {roles.map((role) => (
                  <Box
                    key={role.id}
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1.2fr 1fr 1fr 1.2fr auto",
                      },
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2">{role.roleName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Role ID {role.id}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Site: {role.site || t("common.notAvailable")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      BU: {role.bu || t("common.notAvailable")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Department: {role.department || t("common.notAvailable")}
                    </Typography>
                    <Chip
                      label={formatRoleScope(role) || "Global"}
                      size="small"
                      icon={<AssignmentIndRoundedIcon />}
                      variant="outlined"
                      sx={{ justifySelf: { md: "end" } }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info" variant="outlined">
                No roles are available.
              </Alert>
            )}
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard
        title="Create user"
        subtitle="Create a portal user from an Employee ID before assigning permissions."
        action={<PersonAddAlt1RoundedIcon color="action" />}
      >
        <Stack component="form" spacing={2.5} onSubmit={handleCreateUser}>
          {userCreateError ? (
            <Alert severity="error" variant="outlined">
              {userCreateError}
            </Alert>
          ) : null}
          {createdUser ? (
            <Alert severity="success" variant="outlined">
              Created user{" "}
              {getCreatedUserLabel(createdUser.data, createdUser.employeeId)}.
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 420px) auto" },
              alignItems: "center",
            }}
          >
            <TextField
              label={t("common.employeeId")}
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              required
              fullWidth
              disabled={userCreating}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={
                userCreating ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <PersonAddAlt1RoundedIcon />
                )
              }
              disabled={userCreating}
              sx={{ minHeight: 56 }}
            >
              Create user
            </Button>
          </Box>
        </Stack>
      </SectionCard>
    </Stack>
  );
}
