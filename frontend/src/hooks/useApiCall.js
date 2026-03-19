/**
 * Custom Hook: useApiCall
 * FILE: src/hooks/useApiCall.js
 *
 * Changes from original:
 *  - Handles the new backend response shape: { success, data, message, pagination }
 *  - Returns pagination info when present (for paginated endpoints)
 *  - Added reset() to clear error state
 *  - Added onSuccess / onError callbacks as options
 */

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export const useApiCall = () => {
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [pagination, setPagination] = useState(null);

  /**
   * Call an API function and handle loading/error state
   *
   * @param {function} apiFunction  - async function that returns a response
   * @param {object}   options
   * @param {string}   [options.successMessage]  - toast on success
   * @param {string|false} [options.errorMessage]  - custom error toast (false = silent)
   * @param {function} [options.onSuccess]  - called with result.data on success
   * @param {function} [options.onError]    - called with error message on failure
   */
  const callAPI = useCallback(async (apiFunction, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();

      // Backend returns { success, data, message, pagination }
      if (result?.success) {
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        // Store pagination metadata if present
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (options.onSuccess) {
          options.onSuccess(result.data ?? result);
        }
        return result.data ?? result;
      }

      // success: false — treat as error
      const msg = result?.message || "Something went wrong";
      if (options.errorMessage !== false) {
        toast.error(options.errorMessage || msg);
      }
      setError(msg);
      if (options.onError) options.onError(msg);
      return null;

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred";

      if (options.errorMessage !== false) {
        toast.error(options.errorMessage || msg);
      }
      setError(msg);
      if (options.onError) options.onError(msg);
      return null;

    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear error state */
  const reset = useCallback(() => {
    setError(null);
    setPagination(null);
  }, []);

  return { callAPI, loading, error, pagination, reset };
};

export default useApiCall;