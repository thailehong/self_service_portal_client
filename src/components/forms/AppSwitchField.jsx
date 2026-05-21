import { FormControlLabel, Switch } from '@mui/material';

export function AppSwitchField({ label, checked, onChange, ...props }) {
  return <FormControlLabel control={<Switch checked={checked} onChange={onChange} {...props} />} label={label} />;
}
