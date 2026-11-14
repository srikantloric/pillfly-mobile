import { Linking } from "react-native";

export const SUPPORT_WHATSAPP_URL = "https://wa.me/911234567890";
export const SUPPORT_PHONE_URL = "tel:+912212345678";

export function openSupportWhatsApp(): void {
  Linking.openURL(SUPPORT_WHATSAPP_URL).catch(() => undefined);
}

export function openSupportPhone(): void {
  Linking.openURL(SUPPORT_PHONE_URL).catch(() => undefined);
}
