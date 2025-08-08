import { useEffect, useState } from 'react';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const initialViewportHeight = window.innerHeight;
    setViewportHeight(initialViewportHeight);

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Threshold to determine if keyboard is visible (accounting for browser UI changes)
      const threshold = 150;
      
      if (heightDifference > threshold) {
        setKeyboardHeight(heightDifference);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
      
      setViewportHeight(currentHeight);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - visualHeight;
        
        if (heightDifference > 50) {
          setKeyboardHeight(heightDifference);
          setIsKeyboardVisible(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
        
        setViewportHeight(visualHeight);
      }
    };

    // Use Visual Viewport API if available (more accurate)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible,
    viewportHeight,
    safeViewportHeight: viewportHeight - keyboardHeight
  };
};