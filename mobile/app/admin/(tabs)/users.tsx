import { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  AppText,
  AppHeader,
  AppButton,
  AppCard,
  AppIcon,
  SelectionChip,
} from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { useAppSettings } from "../../../src/context/AppSettingsContext";
import { apiErrorText } from "../../../src/i18n/apiError";
import {
  useSafeAreaInsets,
  horizontalSafePadding,
} from "../../../src/utils/safeArea";
import { formatDateTime } from "../../../src/i18n/format";
import {
  AdminUser,
  AdminUsersPagination,
  apiAdminGetUsers,
  apiAdminSetUserStatus,
} from "../../../src/services/api";

/**
 * Registered users (HE-34) - the admin's account list, now the second tab of
 * the admin area (/admin/users - the (tabs) group segment never appears in
 * the URL).
 *
 * The Dashboard's Elders/Youth metric cards open this tab with
 * ?role=elder / ?role=youth, which pre-applies the matching role filter.
 *
 * Read-only plus one deliberate exception: account status. An admin can
 * disable or re-enable an elder, youth or role-less account, which blocks
 * sign-in and API access while keeping the profile, the cultural content and
 * every collaboration/contribution record. Nothing here deletes users or
 * edits roles or passwords, and admin accounts show their status but cannot
 * be disabled. The route is protected twice - AuthGuard stops non-admins,
 * and the server rejects them with 403 anyway. As a tab root the header
 * shows no Back button; the list reloads page 1 whenever the tab regains
 * focus so it never shows stale rows.
 */
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

type Mode = "initial" | "filter" | "more" | "refresh";

interface RoleChoice {
  label: string;
  /** undefined = no role filter at all ("All"). */
  value: string | undefined;
}

interface StatusChoice {
  label: string;
  /** undefined = no status filter at all ("All"). */
  value: "active" | "disabled" | undefined;
}

/** Badge colours per stored role; the visible label follows the app language. */
const ROLE_BADGE_STYLES: Record<
  string,
  { background: string; color: string }
> = {
  elder: {
    background: colors.primary.main,
    color: colors.primary.contrast,
  },
  youth: {
    background: colors.info.main,
    color: colors.info.contrast,
  },
  admin: {
    background: colors.success.dark,
    color: colors.success.contrast,
  },
  // An account that has not chosen a role yet still has to render sensibly.
  none: {
    background: colors.surface.border,
    color: colors.text.secondary,
  },
};

/**
 * Account status badge. Active reuses the theme's success tone; Disabled is a
 * muted surface pill with a lock glyph so it reads as "no access" without
 * looking like an error.
 */
const STATUS_BADGE_STYLES = {
  active: {
    background: "#E8F5E9",
    border: "#A5D6A7",
    color: colors.success.dark,
  },
  disabled: {
    background: colors.background.secondary,
    border: colors.surface.border,
    color: colors.text.secondary,
  },
} as const;

export default function RegisteredUsersScreen() {
  const router = useRouter();
  const { t, language } = useAppSettings();
  // Owns the top edge (no navigator header) and the modal window's own
  // bottom edge; the tab bar owns the screen's bottom edge.
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminUsersPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState<string | undefined>(undefined);
  const [activeStatus, setActiveStatus] = useState<
    "active" | "disabled" | undefined
  >(undefined);

  // Confirmation target for the disable/enable action, plus the in-flight
  // guard so a second tap cannot submit the same change twice.
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const roleChoices: RoleChoice[] = [
    { label: t("admin.filterAll"), value: undefined },
    { label: t("admin.roleElder"), value: "elder" },
    { label: t("admin.roleYouth"), value: "youth" },
    { label: t("admin.roleAdmin"), value: "admin" },
    { label: t("admin.roleNone"), value: "none" },
  ];

  // A second filter row: it combines with search and role server-side, so the
  // counts under it are the real filtered totals.
  const statusChoices: StatusChoice[] = [
    { label: t("admin.filterAll"), value: undefined },
    { label: t("admin.statusActive"), value: "active" },
    { label: t("admin.statusDisabled"), value: "disabled" },
  ];

  /** Stored role value -> localized badge text; unknown/absent -> no role. */
  const roleLabel = (role: string | null | undefined) => {
    if (role === "elder") return t("admin.roleElder");
    if (role === "youth") return t("admin.roleYouth");
    if (role === "admin") return t("admin.roleAdmin");
    return t("admin.roleNone");
  };

  const accountsUnit = (count: number) =>
    t(count === 1 ? "admin.unitAccountsOne" : "admin.unitAccountsMany");

  // Latest committed filters. Handlers write these synchronously, so a
  // pending debounced search can never fire with a filter the admin has
  // already changed.
  const filtersRef = useRef<{
    search: string;
    role: string | undefined;
    status: "active" | "disabled" | undefined;
  }>({
    search: "",
    role: undefined,
    status: undefined,
  });

  // Monotonic id: only the newest request may touch state, so a slow older
  // response can never overwrite a newer one (rapid filter changes).
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runQuery = async (
    page: number,
    search: string,
    role: string | undefined,
    status: "active" | "disabled" | undefined,
    mode: Mode
  ) => {
    const requestId = ++requestIdRef.current;

    // The newest request owns the loading flags.
    setLoading(mode === "initial" || mode === "filter");
    setLoadingMore(mode === "more");
    setRefreshing(mode === "refresh");
    setError(null);
    setLoadMoreError(null);

    try {
      const result = await apiAdminGetUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role,
        status,
      });

      if (requestId !== requestIdRef.current) return; // superseded

      if (result.success && result.data) {
        const next = result.data.users;
        setUsers((prev) => (page > 1 ? [...prev, ...next] : next));
        setPagination(result.data.pagination);
      } else if (/authentication|signed out/i.test(result.message)) {
        router.replace("/login");
      } else if (page > 1) {
        // Keep what is already on screen and let the admin retry the page.
        setLoadMoreError(
          apiErrorText(result, language) || t("admin.usersLoadMoreError")
        );
      } else {
        setError(
          apiErrorText(result, language) || t("admin.usersLoadError")
        );
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      if (page > 1) {
        setLoadMoreError(t("common.connectionError"));
      } else {
        setError(t("common.connectionError"));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  };

  // Dashboard metric cards navigate here with ?role=elder / ?role=youth.
  // The ref keeps the newest params available to the stable focus callback,
  // which is defined once with no dependencies.
  const params = useLocalSearchParams<{ role?: string }>();
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const focusedOnceRef = useRef(false);

  // Focus covers the first mount too, so there is exactly one initial load.
  // Returning to the tab reloads page 1 with the current filters (same
  // policy as the content tab), and a dashboard ?role= param pre-applies
  // that filter before querying.
  useFocusEffect(
    useCallback(() => {
      const requestedRole = paramsRef.current.role;
      const roleParam =
        requestedRole === "elder" || requestedRole === "youth"
          ? requestedRole
          : undefined;

      if (roleParam && filtersRef.current.role !== roleParam) {
        setActiveRole(roleParam);
        filtersRef.current.role = roleParam;
      }

      const firstFocus = !focusedOnceRef.current;
      focusedOnceRef.current = true;

      runQuery(
        1,
        filtersRef.current.search,
        roleParam ?? filtersRef.current.role,
        filtersRef.current.status,
        firstFocus ? "initial" : "refresh"
      );

      return () => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    filtersRef.current.search = text.trim();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      runQuery(
        1,
        filtersRef.current.search,
        filtersRef.current.role,
        filtersRef.current.status,
        "filter"
      );
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    filtersRef.current.search = "";
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(
      1,
      "",
      filtersRef.current.role,
      filtersRef.current.status,
      "filter"
    );
  };

  const handleRoleSelect = (value: string | undefined) => {
    setActiveRole(value);
    filtersRef.current.role = value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(
      1,
      filtersRef.current.search,
      value,
      filtersRef.current.status,
      "filter"
    );
  };

  const handleStatusSelect = (value: "active" | "disabled" | undefined) => {
    setActiveStatus(value);
    filtersRef.current.status = value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(
      1,
      filtersRef.current.search,
      filtersRef.current.role,
      value,
      "filter"
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveRole(undefined);
    setActiveStatus(undefined);
    filtersRef.current = { search: "", role: undefined, status: undefined };
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(1, "", undefined, undefined, "filter");
  };

  const handleRefresh = () => {
    runQuery(
      1,
      filtersRef.current.search,
      filtersRef.current.role,
      filtersRef.current.status,
      "refresh"
    );
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing) return;
    if (!pagination?.hasNextPage) return;
    runQuery(
      pagination.page + 1,
      filtersRef.current.search,
      filtersRef.current.role,
      filtersRef.current.status,
      "more"
    );
  };

  // ---- Account status (disable / enable) ----

  const askStatusChange = (user: AdminUser) => {
    setStatusError(null);
    setStatusTarget(user);
  };

  const cancelStatusChange = () => {
    if (statusBusy) return;
    setStatusTarget(null);
    setStatusError(null);
  };

  const runStatusChange = async () => {
    const target = statusTarget;
    if (!target || statusBusy) return; // one submission at a time

    const nextActive = !target.active;
    setStatusBusy(true);
    setStatusError(null);

    try {
      const result = await apiAdminSetUserStatus(target.id, nextActive);

      if (result.success) {
        // The badge and the action only move after the server confirmed it:
        // the list is re-read with the current filters instead of patching the
        // row locally, so search, role and status filters stay truthful.
        setStatusTarget(null);
        runQuery(
          1,
          filtersRef.current.search,
          filtersRef.current.role,
          filtersRef.current.status,
          "filter"
        );
        return;
      }

      if (/authentication|signed out/i.test(result.message)) {
        setStatusTarget(null);
        router.replace("/login");
        return;
      }

      // Refused (self/admin account, or the account vanished): explain it in
      // place and keep the list, the search and the pagination untouched.
      setStatusError(
        apiErrorText(result, language) || t("admin.userStatusUpdateFailed")
      );
    } catch {
      setStatusError(t("common.connectionError"));
    } finally {
      setStatusBusy(false);
    }
  };

  const hasFilters = Boolean(
    searchQuery.trim() || activeRole || activeStatus
  );

  const renderEmpty = () => (
    <View style={styles.centered}>
      <AppText variant="title">👥</AppText>
      <AppText variant="body" color={colors.text.secondary} align="center">
        {hasFilters ? t("admin.emptyUsersFiltered") : t("admin.emptyUsers")}
      </AppText>
      {hasFilters && (
        <AppButton
          label={t("admin.clearFilters")}
          onPress={handleClearFilters}
          variant="outline"
          size="sm"
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (!pagination || users.length === 0) return null;

    if (loadMoreError) {
      return (
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.error.main} align="center">
            {loadMoreError}
          </AppText>
          <AppButton
            label={t("common.retry")}
            onPress={handleLoadMore}
            variant="outline"
            size="sm"
          />
        </View>
      );
    }

    if (pagination.hasNextPage) {
      return (
        <View style={styles.footer}>
          <AppButton
            label={loadingMore ? t("admin.loadingMore") : t("admin.loadMore")}
            onPress={handleLoadMore}
            variant="outline"
            fullWidth
            disabled={loadingMore}
            accessibilityLabel={t("admin.loadMoreUsersA11y")}
          />
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.text.tertiary} align="center">
          {t("admin.showingAll", {
            count: pagination.total,
            unit: accountsUnit(pagination.total),
          })}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t("admin.usersTitle")} />

      <View style={styles.filters}>
        <View style={styles.searchBar}>
          <AppText variant="body" color={colors.text.tertiary}>
            🔍
          </AppText>
          <TextInput
            style={styles.searchInput}
            placeholder={t("admin.searchUsersPlaceholder")}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              if (searchTimeoutRef.current)
                clearTimeout(searchTimeoutRef.current);
              runQuery(
                1,
                filtersRef.current.search,
                filtersRef.current.role,
                filtersRef.current.status,
                "filter"
              );
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t("admin.searchUsersA11y")}
          />
          {searchQuery.length > 0 && (
            <AppText
              variant="body"
              color={colors.text.tertiary}
              onPress={handleClearSearch}
              accessibilityRole="button"
            >
              ✕
            </AppText>
          )}
        </View>

        <View style={styles.chipsRow}>
          {roleChoices.map((choice) => (
            <SelectionChip
              key={choice.value ?? "all"}
              label={choice.label}
              selected={activeRole === choice.value}
              onPress={() => handleRoleSelect(choice.value)}
              accessibilityLabel={t("admin.roleFilterA11y", {
                label: choice.label,
              })}
              accessibilityRole="button"
              accessibilityState={{ selected: activeRole === choice.value }}
            />
          ))}
        </View>

        <View style={styles.chipsRow}>
          {statusChoices.map((choice) => (
            <SelectionChip
              key={choice.value ?? "all-status"}
              label={choice.label}
              selected={activeStatus === choice.value}
              onPress={() => handleStatusSelect(choice.value)}
              accessibilityLabel={t("admin.statusFilterA11y", {
                label: choice.label,
              })}
              accessibilityRole="button"
              accessibilityState={{ selected: activeStatus === choice.value }}
            />
          ))}
        </View>

        {!loading && pagination && (
          <AppText variant="caption" color={colors.text.tertiary}>
            {t("admin.showingOf", {
              shown: users.length,
              total: pagination.total,
              unit: accountsUnit(pagination.total),
            })}
          </AppText>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("admin.usersLoading")}
          </AppText>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main} align="center">
            {error}
          </AppText>
          <AppButton
            label={t("common.retry")}
            onPress={() =>
              runQuery(
                1,
                filtersRef.current.search,
                filtersRef.current.role,
                filtersRef.current.status,
                "initial"
              )
            }
            variant="outline"
            size="sm"
            accessibilityLabel={t("admin.retryUsersA11y")}
          />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge =
              ROLE_BADGE_STYLES[item.role ?? "none"] ?? ROLE_BADGE_STYLES.none;
            const registeredText = item.registeredAt
              ? formatDateTime(item.registeredAt, language)
              : null;
            const statusStyle = item.active
              ? STATUS_BADGE_STYLES.active
              : STATUS_BADGE_STYLES.disabled;
            // Admin accounts show their status but never a disable action: the
            // server refuses it, so the button would only ever fail.
            const canChangeStatus = item.role !== "admin";

            return (
              <AppCard style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.identity}>
                    <AppText variant="label">{item.name}</AppText>
                    <AppText
                      variant="bodySmall"
                      color={colors.text.secondary}
                    >
                      {item.email}
                    </AppText>
                  </View>
                  <View style={styles.badges}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: badge.background },
                      ]}
                    >
                      <AppText variant="caption" color={badge.color}>
                        {roleLabel(item.role)}
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.background,
                          borderColor: statusStyle.border,
                        },
                      ]}
                      accessibilityLabel={t("admin.accountStatusA11y", {
                        status: item.active
                          ? t("admin.statusActive")
                          : t("admin.statusDisabled"),
                        name: item.name,
                      })}
                    >
                      <AppIcon
                        name={item.active ? "check-circle" : "slash"}
                        size={12}
                        color={statusStyle.color}
                      />
                      <AppText variant="caption" color={statusStyle.color}>
                        {item.active
                          ? t("admin.statusActive")
                          : t("admin.statusDisabled")}
                      </AppText>
                    </View>
                  </View>
                </View>
                <AppText variant="caption" color={colors.text.tertiary}>
                  {registeredText
                    ? t("admin.registeredOn", { date: registeredText })
                    : t("admin.registeredDateUnknown")}
                </AppText>

                {canChangeStatus && (
                  <AppButton
                    label={
                      item.active
                        ? t("admin.disableAccount")
                        : t("admin.enableAccount")
                    }
                    variant="outline"
                    size="sm"
                    onPress={() => askStatusChange(item)}
                    disabled={statusBusy}
                    accessibilityLabel={
                      item.active
                        ? t("admin.disableAccountA11y", { name: item.name })
                        : t("admin.enableAccountA11y", { name: item.name })
                    }
                    accessibilityRole="button"
                  />
                )}
              </AppCard>
            );
          }}
          ListEmptyComponent={renderEmpty()}
          ListFooterComponent={renderFooter()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          contentContainerStyle={
            users.length === 0 ? styles.emptyList : styles.listContent
          }
        />
      )}

      {/* Disable / enable confirmation. It names the account, states that
          sign-in and access stop while profile and cultural content are
          kept, and stays open with the reason when the server refuses. */}
      <Modal
        visible={statusTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelStatusChange}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window: it clears the home indicator
                // itself rather than inheriting it from the screen.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">
              {statusTarget?.active
                ? t("admin.disableAccountTitle", {
                    name: statusTarget?.name ?? "",
                  })
                : t("admin.enableAccountTitle", {
                    name: statusTarget?.name ?? "",
                  })}
            </AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {statusTarget?.active
                ? t("admin.disableAccountBody")
                : t("admin.enableAccountBody")}
            </AppText>
            {statusError && (
              <AppText
                variant="caption"
                color={colors.error.main}
                accessibilityRole="alert"
              >
                {statusError}
              </AppText>
            )}
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.cancel")}
                  onPress={cancelStatusChange}
                  variant="ghost"
                  fullWidth
                  disabled={statusBusy}
                  accessibilityLabel={t("admin.cancelAccountStatusA11y")}
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={
                    statusBusy
                      ? t("admin.updatingAccount")
                      : statusTarget?.active
                        ? t("admin.disableAccount")
                        : t("admin.enableAccount")
                  }
                  onPress={runStatusChange}
                  fullWidth
                  loading={statusBusy}
                  disabled={statusBusy}
                  accessibilityLabel={
                    statusTarget?.active
                      ? t("admin.confirmDisableA11y", {
                          name: statusTarget.name,
                        })
                      : t("admin.confirmEnableA11y", {
                          name: statusTarget?.name ?? "",
                        })
                  }
                  accessibilityRole="button"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  filters: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  centered: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  card: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    gap: spacing.xxs,
  },
  badges: {
    alignItems: "flex-end",
    gap: spacing.xxs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    // paddingBottom is supplied inline from the insets.
    width: "85%",
    gap: spacing.md,
  },
  modalBody: {
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
    gap: spacing.sm,
    alignItems: "center",
  },
});
