import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { IApiResponse } from '../types/user.types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<IApiResponse<T>>) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await apiCall();
      if (response.success && response.data !== undefined) {
        setState({ data: response.data, isLoading: false, error: null });
        return response.data;
      }
      const errorMsg = response.error?.message || 'An error occurred';
      setState({ data: null, isLoading: false, error: errorMsg });
      return null;
    } catch (err) {
      const axiosError = err as AxiosError<IApiResponse>;
      const errorMsg =
        axiosError.response?.data?.error?.message || axiosError.message || 'An error occurred';
      setState({ data: null, isLoading: false, error: errorMsg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};
