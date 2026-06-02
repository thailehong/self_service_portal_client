import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { useTranslation } from 'react-i18next';
import { formatFileSize } from '../../utils/formatters';

function normalizeFile(file) {
  return {
    id: `${file.name}-${file.lastModified}`,
    file,
    progress: 100,
  };
}

export function DragDropUpload({
  files,
  onFilesChange,
  multiple = true,
  allowedExtensions = ['pdf', 'docx', 'xlsx', 'png', 'jpg'],
  maxSizeMb = 10,
  disabled = false,
  loading = false,
  compact = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const helperText = useMemo(
    () => t('upload.helper', { types: allowedExtensions.join(', ').toUpperCase(), size: maxSizeMb }),
    [allowedExtensions, maxSizeMb, t]
  );

  const validateFiles = (incomingFiles) => {
    const maxBytes = maxSizeMb * 1024 * 1024;
    const validFiles = [];

    incomingFiles.forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        setError(t('upload.invalidType', { name: file.name }));
        return;
      }

      if (file.size > maxBytes) {
        setError(t('upload.invalidSize', { name: file.name }));
        return;
      }

      validFiles.push(normalizeFile(file));
    });

    return validFiles;
  };

  const handleFiles = (incomingFileList) => {
    const nextValid = validateFiles(Array.from(incomingFileList));
    if (!nextValid.length) {
      return;
    }

    setError('');
    onFilesChange(multiple ? [...files, ...nextValid] : [nextValid[0]]);
  };

  const handleRemove = (fileId) => {
    onFilesChange(files.filter((item) => item.id !== fileId));
  };

  return (
    <Stack spacing={compact ? 1.25 : 2.5}>
      <Box
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget)) {
            return;
          }
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) {
            handleFiles(event.dataTransfer.files);
          }
        }}
        sx={{
          p: compact ? 1.5 : 4,
          borderRadius: compact ? 1.5 : 4,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.selected' : 'background.default',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Stack spacing={compact ? 0.75 : 1.5} alignItems="center">
          <CloudUploadRoundedIcon color="primary" sx={{ fontSize: compact ? 26 : 40 }} />
          <Typography variant={compact ? 'body2' : 'h6'}>{t('dashboard.dropzoneTitle')}</Typography>
          <Typography variant={compact ? 'caption' : 'body1'} color="text.secondary">
            {disabled ? t('upload.disabled') : t('dashboard.dropzoneDescription')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {helperText}
          </Typography>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple={multiple}
            onChange={(event) => handleFiles(event.target.files)}
          />
          <Button size={compact ? 'small' : 'medium'} variant="contained" onClick={() => inputRef.current?.click()} disabled={disabled || loading}>
            {t('actions.browse')}
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Typography color="error.main" variant="body2">
          {error}
        </Typography>
      ) : null}

      <List disablePadding>
        {files.length === 0 ? (
          <Typography color="text.secondary">{t('upload.empty')}</Typography>
        ) : (
          files.map((item) => (
            <ListItem
              key={item.id}
              disableGutters
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(item.id)}>
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              }
              sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              <Stack direction="row" spacing={compact ? 1 : 1.5} alignItems="center" sx={{ width: '100%' }}>
                <DescriptionRoundedIcon color="primary" fontSize={compact ? 'small' : 'medium'} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <ListItemText
                    primary={item.file.name}
                    secondary={`${formatFileSize(item.file.size)} • ${item.file.type || 'application/octet-stream'}`}
                    sx={{ m: 0 }}
                    primaryTypographyProps={compact ? { variant: 'body2', noWrap: true } : undefined}
                    secondaryTypographyProps={compact ? { variant: 'caption', noWrap: true } : undefined}
                  />
                  <LinearProgress variant="determinate" value={item.progress || 100} sx={{ mt: compact ? 0.5 : 1, height: compact ? 4 : 8, borderRadius: 999 }} />
                </Box>
                {compact ? null : <Chip label={`${item.progress || 100}%`} size="small" color="primary" variant="outlined" />}
              </Stack>
            </ListItem>
          ))
        )}
      </List>
    </Stack>
  );
}
