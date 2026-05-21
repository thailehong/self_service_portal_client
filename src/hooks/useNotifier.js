import { useContext } from 'react';
import { AppSnackbarContext } from '../components/common/AppSnackbar';

export function useNotifier() {
  return useContext(AppSnackbarContext);
}
