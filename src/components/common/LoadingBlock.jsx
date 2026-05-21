import { Card, CardContent, Skeleton, Stack } from '@mui/material';

export function LoadingBlock({ lines = 4, height = 20 }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.4}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={height} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
