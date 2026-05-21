import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function BreadcrumbsNav({ items = [] }) {
  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.to) {
          return (
            <Typography key={item.label} color="text.primary" variant="body2" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link key={item.label} component={RouterLink} underline="hover" color="inherit" to={item.to} variant="body2">
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
