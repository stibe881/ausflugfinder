import { Alert, Platform } from "react-native";

/**
 * Yes/no confirmation that works on every platform.
 * Alert.alert with buttons does nothing on web, so web uses window.confirm.
 */
export function confirmAsync(
  title: string,
  message: string,
  options: { confirmText?: string; cancelText?: string; destructive?: boolean } = {},
): Promise<boolean> {
  const { confirmText = "OK", cancelText = "Abbrechen", destructive = false } = options;

  if (Platform.OS === "web") {
    const ok = typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`);
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Simple message box that also works on web. */
export function notify(title: string, message?: string): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
