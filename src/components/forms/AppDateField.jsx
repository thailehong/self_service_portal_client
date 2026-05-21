import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export function AppDateField({ label, value, onChange, slotProps, ...props }) {
  return (
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      slotProps={{
        ...slotProps,
        textField: {
          fullWidth: true,
          ...slotProps?.textField,
        },
      }}
      {...props}
    />
  );
}
