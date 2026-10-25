import { useEffect, useRef } from "react";
import { Keyboard, Platform } from "react-native";

const DEFAULT_DURATION = 250;

/**
 * Calls `onChange(height, duration)` when the keyboard shows (height > 0) or hides (height 0).
 * iOS uses the "will" events so animations can run in step with the keyboard.
 */
export function useKeyboardHeight(
  onChange: (height: number, duration: number) => void,
  enabled = true,
): void {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const isIOS = Platform.OS === "ios";
    const durationOf = (duration: number) => (isIOS && duration ? duration : DEFAULT_DURATION);

    const showSub = Keyboard.addListener(isIOS ? "keyboardWillShow" : "keyboardDidShow", (event) => {
      onChangeRef.current(event.endCoordinates.height, durationOf(event.duration));
    });
    const hideSub = Keyboard.addListener(isIOS ? "keyboardWillHide" : "keyboardDidHide", (event) => {
      onChangeRef.current(0, durationOf(event.duration));
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [enabled]);
}
