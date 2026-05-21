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
    <Stack spacing={2.5}>
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
          p: 4,
          borderRadius: 4,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.selected' : 'background.default',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6">{t('dashboard.dropzoneTitle')}</Typography>
          <Typography color="text.secondary">{disabled ? t('upload.disabled') : t('dashboard.dropzoneDescription')}</Typography>
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
          <Button variant="contained" onClick={() => inputRef.current?.click()} disabled={disabled || loading}>
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <DescriptionRoundedIcon color="primary" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <ListItemText
                    primary={item.file.name}
                    secondary={`${formatFileSize(item.file.size)} • ${item.file.type || 'application/octet-stream'}`}
                    sx={{ m: 0 }}
                  />
                  <LinearProgress variant="determinate" value={item.progress || 100} sx={{ mt: 1, height: 8, borderRadius: 999 }} />
                </Box>
                <Chip label={`${item.progress || 100}%`} size="small" color="primary" variant="outlined" />
              </Stack>
            </ListItem>
          ))
        )}
      </List>
    </Stack>
  );
}
