import { MenuItem, TextField } from '@mui/material';

export function AppSelectField({ options = [], ...props }) {
  return (
    <TextField select {...props}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
