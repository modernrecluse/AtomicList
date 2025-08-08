import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    // Check if device supports haptic feedback
    if (!navigator.vibrate) return;

    // Define vibration patterns
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [50, 100, 50, 100, 50],
      selection: [5]
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  }, []);

  const triggerSelectionHaptic = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  const triggerSuccessHaptic = useCallback(() => {
    triggerHaptic('success');
  }, [triggerHaptic]);

  const triggerErrorHaptic = useCallback(() => {
    triggerHaptic('error');
  }, [triggerHaptic]);

  const triggerLightHaptic = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSelectionHaptic,
    triggerSuccessHaptic,
    triggerErrorHaptic,
    triggerLightHaptic,
    isSupported: Boolean(navigator.vibrate)
  };
};