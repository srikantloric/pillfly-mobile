import { Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

export async function copyToClipboard(
  text: string,
  successMessage = 'Copied to clipboard',
): Promise<boolean> {
  const value = text.trim();
  if (!value) {
    return false;
  }

  try {
    Clipboard.setString(value);
    Alert.alert('Copied', successMessage);
    return true;
  } catch {
    Alert.alert('Unable to copy', 'Please try again.');
    return false;
  }
}
