/**
 * ContentPreviewCard — the shared cultural item card (Youth home, Explore,
 * Saved).
 *
 * Rounded white surface with a thin border, the uploaded photo inset with
 * rounded corners (a warm icon placeholder when the item has none), a small
 * category badge, a bold title, a short excerpt, a divider and the
 * contributor row. Tapping opens the caller's detail route, so the same card
 * works for both roles.
 */

import { Image, StyleSheet, View } from "react-native";
import { AppCard } from "./AppCard";
import { AppIcon, IconName } from "./AppIcon";
import { AppText } from "./AppText";
import { UserAvatar } from "./UserAvatar";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useAppSettings } from "../context/AppSettingsContext";
import { resolveImageUrl } from "../services/api";
import { FALLBACK_CATEGORY_ICON } from "../utils/categoryIcon";

/**
 * Stand-in for {name} while the translated "Shared by {name}" sentence is
 * split around its slot, so the contributor keeps its emphasised style.
 * Sinhala puts the name first, so a fixed prefix/suffix pair cannot work.
 */
const SHARED_BY_SLOT = "\u0000";

export interface ContentPreviewCardProps {
  /** Stored image path (server-relative or absolute); null falls back. */
  imageUrl?: string | null;
  /** Icon shown when there is no photo - usually categoryIcon(key). */
  fallbackIcon?: IconName;
  /** Already-resolved display label (categoryLabel(categories, key)). */
  categoryLabel?: string;
  title: string;
  excerpt?: string;
  contributor?: string;
  /** Creator's photo path so the contributor row shows a face when it has one. */
  contributorImage?: string | null;
  /** Warm (Youth) or neutral border tone. */
  warm?: boolean;
  onPress?: () => void;
}

export function ContentPreviewCard({
  imageUrl,
  fallbackIcon = FALLBACK_CATEGORY_ICON,
  categoryLabel,
  title,
  excerpt,
  contributor,
  contributorImage,
  warm = false,
  onPress,
}: ContentPreviewCardProps) {
  const { t } = useAppSettings();
  const imageUri = resolveImageUrl(imageUrl);
  const sharedBy = t("content.sharedBy", { name: SHARED_BY_SLOT }).split(
    SHARED_BY_SLOT
  );

  return (
    <AppCard
      style={[styles.card, warm && styles.cardWarm]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("content.cardA11y", { title })}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <AppIcon name={fallbackIcon} size={44} color={colors.text.tertiary} />
        </View>
      )}

      {categoryLabel ? (
        <View style={styles.badge}>
          <AppText variant="caption" color={colors.primary.main}>
            {categoryLabel.toUpperCase()}
          </AppText>
        </View>
      ) : null}

      <AppText variant="subheading" numberOfLines={2}>
        {title}
      </AppText>

      {excerpt ? (
        <AppText variant="bodySmall" color={colors.text.secondary} numberOfLines={3}>
          {excerpt}
        </AppText>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.contributor}>
        <UserAvatar
          name={contributor}
          profileImage={contributorImage}
          size={26}
          style={styles.avatar}
          textVariant="caption"
        />
        <AppText variant="caption" color={colors.text.secondary}>
          {sharedBy[0]}
          <AppText variant="label" color={colors.primary.main}>
            {contributor || t("content.unknown")}
          </AppText>
          {sharedBy[1]}
        </AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  cardWarm: {
    borderColor: colors.warm.border,
  },
  image: {
    width: "100%",
    height: 170,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  placeholder: {
    height: 170,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.warm,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    alignSelf: "flex-start",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginTop: spacing.xs,
  },
  contributor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
});
