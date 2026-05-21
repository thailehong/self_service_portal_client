import { Autocomplete, TextField } from '@mui/material';

export function AppAutocompleteField({ label, options = [], value, onChange, getOptionLabel = (option) => option?.label || '', ...props }) {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, nextValue) => onChange(nextValue)}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => <TextField {...params} label={label} />}
      {...props}
    />
  );
}
