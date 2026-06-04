import React, { memo } from "react";
import { Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { HomePromoBanner, homePromoBannerAssets } from "@/components/home/HomePromoBanner";
import { PlaceholderSection } from "@/components/product";
import { PlusMembershipBanner } from "@/components/profile/PlusMembershipBanner";
import {
  Accordion,
  HorizontalScrollRow,
  IconTextRow,
  LinkRow,
  SectionHeaderRow,
} from "@/components/ui";
import { colors } from "@/theme";

import type { ProductDetailScrollSection } from "./productDetail.sections";

const ACCORDION_SECTIONS: ReadonlySet<ProductDetailScrollSection> = new Set([
  "Uses",
  "Contraindications",
  "Side Effects",
  "Precautions & Warnings",
  "Additional Information",
  "FAQ",
  "References",
  "Product Details",
]);

const CAROUSEL_SECTIONS: ReadonlySet<ProductDetailScrollSection> = new Set([
  "Frequently Bought Together",
  "Customers Also Viewed",
  "Recommended For You",
  "Previously Browsed",
]);

function ImageCarouselPlaceholder() {
  return (
    <View className="mb-3">
      <HorizontalScrollRow contentClassName="px-0 pb-1" gapClassName="gap-0">
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            className="h-[280px] w-full items-center justify-center border-b border-dashed border-pillfly-line bg-pillfly-surface"
          >
            <Text className="text-[13px] font-medium text-pillfly-muted">Product image {index + 1}</Text>
          </View>
        ))}
      </HorizontalScrollRow>
    </View>
  );
}

function CarouselSectionPlaceholder({ title }: { title: string }) {
  return (
    <View className="mb-3 px-4">
      <SectionHeaderRow title={title} actionLabel="View all" />
      <HorizontalScrollRow>
        {[1, 2, 3].map((slot) => (
          <View
            key={slot}
            className="h-[168px] w-[132px] rounded-xl border border-dashed border-pillfly-line bg-pillfly-surface"
          />
        ))}
      </HorizontalScrollRow>
    </View>
  );
}

function InformationTabsPlaceholder() {
  const tabs = ["Description", "Uses", "Side Effects", "Precautions"];
  return (
    <View className="mb-3">
      <HorizontalScrollRow contentClassName="px-4 pb-2" gapClassName="gap-2">
        {tabs.map((tab) => (
          <View
            key={tab}
            className="rounded-full border border-pillfly-line bg-pillfly-surface px-4 py-2"
          >
            <Text className="text-[13px] font-semibold text-pillfly-ink">{tab}</Text>
          </View>
        ))}
      </HorizontalScrollRow>
      <PlaceholderSection title="Tab content" />
    </View>
  );
}

function ShareRowPlaceholder() {
  const networks = ["message-circle", "mail", "share-2"] as const;
  return (
    <View className="mx-4 mb-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-4">
      <Text className="mb-3 text-[14px] font-bold text-pillfly-ink">Share With Friends</Text>
      <View className="flex-row items-center gap-4">
        {networks.map((icon) => (
          <View
            key={icon}
            className="h-11 w-11 items-center justify-center rounded-full border border-pillfly-line bg-pillfly-background"
          >
            <Feather name={icon} size={20} color={colors.primary} />
          </View>
        ))}
      </View>
    </View>
  );
}

function OffersPlaceholder() {
  return (
    <View className="mx-4 mb-3">
      <SectionHeaderRow title="Offers" className="mb-2" />
      {[1, 2].map((slot) => (
        <View
          key={slot}
          className="mb-2 rounded-xl border border-dashed border-pillfly-line bg-pillfly-surface px-4 py-4"
        >
          <Text className="text-[13px] font-medium text-pillfly-muted">Coupon / offer slot {slot}</Text>
        </View>
      ))}
    </View>
  );
}

function DisclaimerBlock() {
  return (
    <View className="mx-4 mb-6 rounded-xl bg-pillfly-background px-3 py-4">
      <Text className="text-[11px] leading-[16px] text-pillfly-muted">
        Disclaimer: Information on this page is for general awareness only and is not a substitute
        for professional medical advice. Always consult your doctor before use.
      </Text>
    </View>
  );
}

type Props = {
  section: ProductDetailScrollSection;
};

export const ProductDetailSectionView = memo(function ProductDetailSectionView({ section }: Props) {
  if (section === "Product Image Carousel") {
    return <ImageCarouselPlaceholder />;
  }

  if (section === "Membership Banner") {
    return (
      <View className="mx-4 mb-3">
        <PlusMembershipBanner />
      </View>
    );
  }

  if (section === "Delivery Information") {
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
        <IconTextRow icon={<Feather name="truck" size={18} color={colors.primary} />}>
          <Text className="text-[13px] text-pillfly-ink">
            Delivery by tomorrow · Pincode check (placeholder)
          </Text>
        </IconTextRow>
      </View>
    );
  }

  if (section === "Return Policy") {
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
        <IconTextRow
          icon={<Feather name="rotate-ccw" size={18} color={colors.primary} />}
          showChevron
        >
          <Text className="text-[13px] font-semibold text-pillfly-ink">Return policy</Text>
        </IconTextRow>
      </View>
    );
  }

  if (section === "Composition Section") {
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
        <LinkRow
          icon={<Feather name="layers" size={18} color={colors.primary} />}
          title="Composition"
          subtitle="Active ingredients (placeholder)"
        />
      </View>
    );
  }

  if (section === "Therapeutic Classification") {
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
        <LinkRow
          icon={<Feather name="book-open" size={18} color={colors.primary} />}
          title="Therapeutic classification"
          subtitle="Drug class details (placeholder)"
        />
      </View>
    );
  }

  if (section === "Promotional Banner") {
    return (
      <View className="mb-3 items-center px-4">
        <HomePromoBanner source={homePromoBannerAssets.medicine27} />
      </View>
    );
  }

  if (CAROUSEL_SECTIONS.has(section)) {
    return <CarouselSectionPlaceholder title={section} />;
  }

  if (section === "Information Tabs") {
    return <InformationTabsPlaceholder />;
  }

  if (ACCORDION_SECTIONS.has(section)) {
    return (
      <Accordion title={section}>
        <Text className="text-[13px] leading-[20px] text-pillfly-muted">
          {section} content will be wired from product / API data.
        </Text>
      </Accordion>
    );
  }

  if (section === "Offers") {
    return <OffersPlaceholder />;
  }

  if (section === "Share With Friends") {
    return <ShareRowPlaceholder />;
  }

  if (section === "Disclaimer") {
    return <DisclaimerBlock />;
  }

  return <PlaceholderSection title={section} />;
});

ProductDetailSectionView.displayName = "ProductDetailSectionView";
