import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Virtual keyboard detection hook
 * Detects when mobile virtual keyboard is open/closed
 */
function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const lastViewportHeight = useRef(0);
  const lastWindowHeight = useRef(0);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyboardState = useRef(false);
  const consecutiveFalseCount = useRef(0);
  const isIOS = useRef(false);
  const initialScreenHeight = useRef(0);
  const hasInputFocused = useRef(false);

  // Detect iOS on initialization
  useEffect(() => {
    isIOS.current = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Store initial screen height for iOS
    if (typeof window !== "undefined") {
      initialScreenHeight.current = window.screen.height;
    }
  }, []);

  // Enhanced debounced state update with iOS-specific logic
  const debouncedSetKeyboardState = useCallback((open: boolean, height = 0) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // For iOS, we need to be more careful about false negatives
    if (isIOS.current && !open && lastKeyboardState.current) {
      consecutiveFalseCount.current++;

      // On iOS, require multiple consecutive false readings before accepting keyboard is closed
      if (consecutiveFalseCount.current < 3) {
        return;
      }
    } else if (isIOS.current && open) {
      // Reset counter when keyboard is detected as open
      consecutiveFalseCount.current = 0;
    }

    // Set debounce timeout
    debounceTimeoutRef.current = setTimeout(
      () => {
        // Only update if state actually changed
        if (lastKeyboardState.current !== open) {
          setIsKeyboardOpen(open);
          setKeyboardHeight(height);
          lastKeyboardState.current = open;
        }
      },
      isIOS.current ? 150 : 50,
    ); // Longer debounce for iOS
  }, []);

  // iOS-specific keyboard detection that doesn't rely on visual viewport
  const checkIOSKeyboardState = useCallback(() => {
    if (!isIOS.current || typeof window === "undefined") return;

    const windowHeight = window.innerHeight;
    const screenHeight = window.screen.height;
    const heightDifference = screenHeight - windowHeight;

    // On iOS, if we have a focused input and significant height difference, keyboard is likely open
    if (hasInputFocused.current && heightDifference > 150) {
      debouncedSetKeyboardState(true, heightDifference);
      return;
    }

    // Additional iOS check: if window height is significantly smaller than screen height
    if (hasInputFocused.current && windowHeight < screenHeight * 0.8) {
      debouncedSetKeyboardState(true, heightDifference);
      return;
    }

    // If no input is focused, keyboard should be closed
    if (!hasInputFocused.current) {
      debouncedSetKeyboardState(false, 0);
    }
  }, [debouncedSetKeyboardState]);

  // Method 1: Visual Viewport API (most accurate for modern browsers, but unreliable on iOS)
  const handleVisualViewportChange = useCallback(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    // Skip visual viewport detection on iOS as it's unreliable
    if (isIOS.current) {
      return;
    }

    const viewportHeight = window.visualViewport.height;
    const windowHeight = window.innerHeight;
    const viewportTop = window.visualViewport.offsetTop;

    // Calculate keyboard height
    const calculatedKeyboardHeight = windowHeight - viewportHeight;

    // Detect keyboard based on viewport changes
    const isKeyboardOpen = calculatedKeyboardHeight > 150;

    // Additional check: if viewport is pushed up significantly
    const isViewportPushedUp =
      viewportTop > 0 && calculatedKeyboardHeight > 100;

    const finalKeyboardState = isKeyboardOpen || isViewportPushedUp;

    debouncedSetKeyboardState(finalKeyboardState, calculatedKeyboardHeight);

    lastViewportHeight.current = viewportHeight;
    lastWindowHeight.current = windowHeight;
  }, [debouncedSetKeyboardState]);

  // Method 2: Window resize fallback (for older browsers and iOS)
  const handleWindowResize = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const windowHeight = window.innerHeight;
    const screenHeight = window.screen.height;

    // For iOS, use our custom detection method
    if (isIOS.current) {
      checkIOSKeyboardState();
      return;
    }

    // Only use this method if visualViewport is not available
    if (!window.visualViewport) {
      const heightDifference = screenHeight - windowHeight;
      const isKeyboardOpen =
        heightDifference > 150 && windowHeight < screenHeight * 0.8;

      debouncedSetKeyboardState(isKeyboardOpen, heightDifference);
    }

    lastWindowHeight.current = windowHeight;
  }, [debouncedSetKeyboardState, checkIOSKeyboardState]);

  // Method 3: Focus/Blur detection with debouncing
  const handleInputFocus = useCallback(() => {
    // Mark that we have a focused input
    hasInputFocused.current = true;

    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    // Set focus timeout to account for keyboard animation
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    focusTimeoutRef.current = setTimeout(
      () => {
        if (isIOS.current) {
          checkIOSKeyboardState();
        } else if (window.visualViewport) {
          handleVisualViewportChange();
        } else {
          debouncedSetKeyboardState(true);
        }
      },
      isIOS.current ? 600 : 300,
    ); // Much longer delay for iOS
  }, [
    handleVisualViewportChange,
    debouncedSetKeyboardState,
    checkIOSKeyboardState,
  ]);

  const handleInputBlur = useCallback(() => {
    // Mark that no input is focused
    hasInputFocused.current = false;

    // Clear any pending focus timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // Set blur timeout to account for keyboard animation
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = setTimeout(
      () => {
        if (isIOS.current) {
          checkIOSKeyboardState();
        } else if (window.visualViewport) {
          handleVisualViewportChange();
        } else {
          debouncedSetKeyboardState(false, 0);
        }
      },
      isIOS.current ? 600 : 300,
    ); // Much longer delay for iOS
  }, [
    handleVisualViewportChange,
    debouncedSetKeyboardState,
    checkIOSKeyboardState,
  ]);

  // Method 4: Orientation change detection
  const handleOrientationChange = useCallback(() => {
    // Reset keyboard state on orientation change
    setTimeout(
      () => {
        if (isIOS.current) {
          checkIOSKeyboardState();
        } else if (window.visualViewport) {
          handleVisualViewportChange();
        } else {
          handleWindowResize();
        }
      },
      isIOS.current ? 1000 : 500,
    ); // Much longer delay for iOS
  }, [handleVisualViewportChange, handleWindowResize, checkIOSKeyboardState]);

  // Method 5: Page visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, likely keyboard is closed
      hasInputFocused.current = false;
      debouncedSetKeyboardState(false, 0);
    } else {
      // Page is visible again, re-check keyboard state
      setTimeout(
        () => {
          if (isIOS.current) {
            checkIOSKeyboardState();
          } else if (window.visualViewport) {
            handleVisualViewportChange();
          } else {
            handleWindowResize();
          }
        },
        isIOS.current ? 300 : 100,
      ); // Longer delay for iOS
    }
  }, [
    handleVisualViewportChange,
    handleWindowResize,
    debouncedSetKeyboardState,
    checkIOSKeyboardState,
  ]);

  useEffect(() => {
    // Set initial values
    if (typeof window !== "undefined") {
      lastViewportHeight.current =
        window.visualViewport?.height || window.innerHeight;
      lastWindowHeight.current = window.innerHeight;
    }

    // Add event listeners
    if (window.visualViewport && !isIOS.current) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportChange,
      );
      window.visualViewport.addEventListener(
        "scroll",
        handleVisualViewportChange,
      );
    }

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial check
    if (isIOS.current) {
      checkIOSKeyboardState();
    } else if (window.visualViewport) {
      handleVisualViewportChange();
    } else {
      handleWindowResize();
    }

    return () => {
      // Cleanup timeouts
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Remove event listeners
      if (window.visualViewport && !isIOS.current) {
        window.visualViewport.removeEventListener(
          "resize",
          handleVisualViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleVisualViewportChange,
        );
      }

      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    handleVisualViewportChange,
    handleWindowResize,
    handleOrientationChange,
    handleVisibilityChange,
    checkIOSKeyboardState,
  ]);

  return {
    isKeyboardOpen,
    keyboardHeight,
    handleInputFocus,
    handleInputBlur,
    // Utility function to manually check keyboard state
    checkKeyboardState: () => {
      if (isIOS.current) {
        checkIOSKeyboardState();
      } else if (window.visualViewport) {
        handleVisualViewportChange();
      } else {
        handleWindowResize();
      }
    },
  };
}

export default useVirtualKeyboard; 