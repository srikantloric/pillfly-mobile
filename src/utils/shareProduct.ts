import { Alert, Linking, Share } from "react-native";

import type { ProductDetailShareChannelId } from "@/mocks/productDetail.mock";

function buildShareMessage(productTitle: string): string {
  return `Check out ${productTitle} on Pillfly`;
}

function getChannelUrl(channel: ProductDetailShareChannelId, message: string): string | null {
  const encoded = encodeURIComponent(message);

  switch (channel) {
    case "whatsapp":
      return `whatsapp://send?text=${encoded}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?quote=${encoded}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encoded}`;
    default:
      return null;
  }
}

export async function shareProductOnChannel(
  channel: ProductDetailShareChannelId,
  productTitle: string,
): Promise<void> {
  const message = buildShareMessage(productTitle);
  const url = getChannelUrl(channel, message);

  if (url) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // Fall through to system share sheet.
    }
  }

  try {
    await Share.share({ message });
  } catch {
    Alert.alert("Unable to share", "Please try again in a moment.");
  }
}
