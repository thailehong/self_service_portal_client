import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppTextField } from '../components/forms/AppTextField';
import { PasswordField } from '../components/forms/PasswordField';
import { FormSectionCard } from '../components/forms/FormSectionCard';
import { SubmitButton } from '../components/forms/SubmitButton';
import { AppDateField } from '../components/forms/AppDateField';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { clearAuthError, register, selectAuth } from '../features/auth/authSlice';

const initialForm = {
  employeeId: '',
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  startDate: dayjs()
};

export function RegisterPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  const passwordHelper = !form.password
    ? t('auth.helperPassword')
    : form.password.length >= 8
      ? t('auth.helperPasswordValid')
      : t('auth.validationPasswordLength');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');

    if (!form.employeeId.trim() || !form.username.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setValidationError(t('auth.validationRequired'));
      return;
    }

    if (form.password.length < 8) {
      setValidationError(t('auth.validationPasswordLength'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setValidationError(t('auth.validationPasswordMismatch'));
      return;
    }

    await dispatch(
      register({
        employeeId: form.employeeId.trim(),
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        password: form.password,
        confirmPassword: form.confirmPassword
      })
    );
  };

  return (
    <AuthLayout title={t('auth.registerHeading')} description={t('auth.registerDescription')}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography variant="h4">{t('auth.registerTitle')}</Typography>
              <Typography color="text.secondary">{t('auth.tagline')}</Typography>
            </Stack>

            {(validationError || auth.error) && <Alert severity="error">{validationError || auth.error}</Alert>}

            <FormSectionCard title={t('auth.formSections.identity')}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <AppTextField label={t('common.employeeId')} value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} />
                  <AppTextField label={t('common.username')} value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <AppTextField label={t('common.firstName')} value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
                  <AppTextField label={t('common.lastName')} value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <AppTextField label={t('common.email')} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                  <AppDateField label={t('common.startDate')} value={form.startDate} onChange={(value) => setForm((current) => ({ ...current, startDate: value }))} />
                </Stack>
              </Stack>
            </FormSectionCard>

            <FormSectionCard title={t('auth.formSections.credentials')}>
              <Stack spacing={2}>
                <PasswordField
                  label={t('common.password')}
                  helperText={passwordHelper}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
                <PasswordField
                  label={t('common.confirmPassword')}
                  value={form.confirmPassword}
                  onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                />
              </Stack>
            </FormSectionCard>

            <SubmitButton loading={auth.status === 'loading'}>{auth.status === 'loading' ? t('auth.submittingRegister') : t('actions.register')}</SubmitButton>

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Typography color="text.secondary">
                {t('auth.alreadyRegistered')} {' '}
                <Link component={RouterLink} underline="hover" to="/login">
                  {t('auth.signInCta')}
                </Link>
              </Typography>
              <Button component={RouterLink} to="/" size="small">
                {t('actions.goHome')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
