/**
 * Admin area (HE-34/35/36): dashboard, registered users, categories and
 * cultural-content management strings.
 *
 * Only interface copy lives here. User-authored data (names, emails, item
 * titles/content, stored category labels) and the immutable stored category
 * keys are never dictionary values - they are interpolated as params or
 * passed through `categoryLabel` / `translateBuiltin`.
 */

export const enAdmin = {
  // Screen titles (stack + AppHeader)
  "admin.title": "Admin",
  "admin.homeTitle": "Admin Home",
  "admin.categoriesTitle": "Categories",
  "admin.usersTitle": "Registered Users",
  "admin.contentTitle": "Cultural Content",
  "admin.itemTitle": "Item",
  "admin.editItemTitle": "Edit Item",

  // Admin home / dashboard
  "admin.signedInAs": "Signed in as {name}",
  "admin.administrator": "Administrator",
  "admin.contentCategories": "Content Categories",
  "admin.categoriesCardBody":
    "Add categories, edit the labels everyone sees, and deactivate or reactivate them. The key stored on existing content never changes.",
  "admin.manageCategories": "Manage Categories",
  "admin.manageCategoriesA11y": "Manage content categories",
  "admin.usersCardBody":
    "Browse every registered account - search by name or email, filter by role, and see when each account registered. Viewing only.",
  "admin.viewUsers": "View Registered Users",
  "admin.contentCardBody":
    "Browse every Elder's cultural items - search and filter them, open one to inspect it, correct its title, content or category, and delete it together with everything linked to it.",
  "admin.manageContent": "Manage Cultural Content",
  "admin.accessCheckTitle": "Access Check",
  "admin.accessCheckBody":
    "Calls an admin-only API endpoint. Elder and Youth accounts are rejected by the server.",
  "admin.accessConfirmed": "Server confirmed admin access.",
  "admin.accessDenied": "Admin access denied.",
  "admin.checking": "Checking...",
  "admin.verifyAccess": "Verify Admin Access",
  "admin.loggingOut": "Logging out...",

  // Dashboard tab (four-tab redesign)
  "admin.dashboardTitle": "Admin Dashboard",
  "admin.dashboardSubtitle":
    "Overview of preservation metrics and user requests.",
  "admin.dashboardLoadError": "Failed to load the dashboard",
  "admin.loadingDashboard": "Loading dashboard...",
  "admin.retryDashboardA11y": "Retry loading the dashboard",
  "admin.refreshDashboardA11y": "Refresh dashboard data",
  "admin.metricTotalUsers": "Total Users",
  "admin.metricElders": "Elders",
  "admin.metricYouth": "Youth",
  "admin.metricContent": "Cultural Content",
  "admin.metricTotalUsersA11y":
    "Total users: {count}. Opens registered users.",
  "admin.metricEldersA11y":
    "Elders: {count}. Opens registered users filtered to elders.",
  "admin.metricYouthA11y":
    "Youth: {count}. Opens registered users filtered to youth.",
  "admin.metricContentA11y":
    "Cultural content: {count}. Opens cultural content management.",
  "admin.recentActivity": "Recent Activity",
  "admin.activityEmpty": "No recent activity yet.",
  "admin.activityUserRegistered": "New user registered",
  "admin.activityUserRegisteredDesc": "{name} joined as {role}",
  "admin.activityContentAdded": "New cultural content added",
  "admin.activityContentAddedDesc": "{title} submitted",
  "admin.activityContributionApproved": "Contribution approved",
  "admin.activityContributionApprovedDesc":
    "{name}'s contribution to {title} approved",
  "admin.a11yTabDashboard": "Dashboard tab",
  "admin.a11yTabUsers": "Users tab",
  "admin.a11yTabContents": "Contents tab",
  "admin.a11yTabSettings": "Settings tab",

  // Registered users list
  "admin.usersLoading": "Loading registered users...",
  "admin.usersLoadError": "Failed to load registered users",
  "admin.usersLoadMoreError": "Could not load more users.",
  "admin.searchUsersPlaceholder": "Search by name or email...",
  "admin.searchUsersA11y": "Search registered users by name or email",
  "admin.filterAll": "All",
  "admin.roleElder": "Elder",
  "admin.roleYouth": "Youth",
  "admin.roleAdmin": "Admin",
  "admin.roleNone": "No role",
  "admin.roleFilterA11y": "{label} role filter",
  "admin.emptyUsersFiltered":
    "No accounts match the current search and role filter.",
  "admin.emptyUsers": "No registered users yet.",
  "admin.clearFilters": "Clear filters",
  "admin.loadMore": "Load more",
  "admin.loadingMore": "Loading more...",
  "admin.loadMoreUsersA11y": "Load the next page of registered users",
  "admin.showingAll": "Showing all {count} {unit}",
  "admin.showingOf": "Showing {shown} of {total} {unit}",
  "admin.unitAccountsOne": "account",
  "admin.unitAccountsMany": "accounts",
  "admin.registeredOn": "Registered {date}",
  "admin.registeredDateUnknown": "Registration date unknown",
  "admin.retryUsersA11y": "Retry loading registered users",

  // Account status (Active / Disabled)
  "admin.statusActive": "Active",
  "admin.statusDisabled": "Disabled",
  "admin.statusFilterA11y": "{label} account status filter",
  "admin.accountStatusA11y": "{name}: {status}",
  "admin.disableAccount": "Disable Account",
  "admin.enableAccount": "Enable Account",
  "admin.disableAccountTitle": "Disable “{name}”’s account?",
  "admin.enableAccountTitle": "Re-enable “{name}”’s account?",
  "admin.disableAccountBody":
    "They will not be able to sign in, and any app session they have open stops working right away. Their profile, cultural content and collaboration history are all kept, and you can enable the account again at any time.",
  "admin.enableAccountBody":
    "They will be able to sign in again immediately, with the same profile, cultural content and collaboration history.",
  "admin.updatingAccount": "Updating...",
  "admin.userStatusUpdateFailed": "Could not update this account.",
  "admin.disableAccountA11y": "Disable the account {name}",
  "admin.enableAccountA11y": "Enable the account {name}",
  "admin.cancelAccountStatusA11y": "Cancel changing this account's status",
  "admin.confirmDisableA11y": "Confirm disabling the account {name}",
  "admin.confirmEnableA11y": "Confirm re-enabling the account {name}",

  // Cultural content list
  "admin.contentLoading": "Loading cultural content...",
  "admin.contentLoadError": "Failed to load cultural content",
  "admin.contentLoadMoreError": "Could not load more items.",
  "admin.searchContentPlaceholder": "Search title or content...",
  "admin.searchContentA11y": "Search cultural content by title or content",
  "admin.categoryFilterA11y": "{label} category filter",
  "admin.emptyContentFiltered":
    "No items match the current search and category filter.",
  "admin.emptyContent": "No cultural content yet.",
  "admin.loadMoreContentA11y": "Load the next page of cultural content",
  "admin.unitItemsOne": "item",
  "admin.unitItemsMany": "items",
  "admin.manageCardA11y": "Manage {title} by {name}",
  "admin.by": "By {name}",
  "admin.createdOn": "Created {date}",
  "admin.updatedOn": "Updated {date}",
  "admin.creationDateUnknown": "Creation date unknown",
  "admin.retryContentA11y": "Retry loading cultural content",

  // Categories management
  "admin.categoriesIntro":
    "The key is stored on content and never changes. The label is what everyone sees.",
  "admin.addCategory": "Add category",
  "admin.keyField": "Key *",
  "admin.keyPlaceholder": "e.g. Festival",
  "admin.labelField": "Label",
  "admin.labelPlaceholder": "Shown to users, defaults to the key",
  "admin.keyRequired": "Key is required",
  "admin.labelRequired": "Label is required",
  "admin.adding": "Adding...",
  "admin.addCategoryBtn": "Add Category",
  "admin.allCategories": "All categories ({count})",
  "admin.emptyCategories": "No categories yet. Add one above.",
  "admin.active": "Active",
  "admin.inactive": "Inactive",
  "admin.keyStoredOnContent": "Key: {key} (stored on content)",
  "admin.editLabel": "Edit label",
  "admin.saving": "Saving...",
  "admin.deactivate": "Deactivate",
  "admin.reactivate": "Reactivate",
  "admin.deactivateTitle": "Deactivate category?",
  "admin.reactivateTitle": "Reactivate category?",
  "admin.deactivateBody":
    "\"{label}\" will no longer be offered when creating or moving content. Content already using it stays readable and can keep the category when edited.",
  "admin.reactivateBody":
    "\"{label}\" will be offered again as a content category.",
  "admin.categoryCreated": "Category created",
  "admin.labelUpdated": "Label updated",
  "admin.categoryUpdated": "Category updated",
  "admin.deleteCategoryTitle": "Delete “{label}”?",
  "admin.deleteCategoryBody":
    "“{label}” will be removed from the category list for good. This cannot be undone, and no cultural content is ever deleted with it. A category that content still uses, or a built-in default category, can only be deactivated.",
  "admin.deleteCategoryFailed": "Could not delete this category.",
  "admin.categoryDeleted": "Category deleted",
  "admin.deleteCategoryA11y": "Delete {label}",
  "admin.cancelDeleteCategoryA11y": "Cancel deleting this category",
  "admin.confirmDeleteCategoryA11y":
    "Confirm deleting {label} permanently",

  // Content detail
  "admin.loadingItem": "Loading item...",
  "admin.itemNotFound":
    "This item could not be found. It may already have been deleted, or the link may be invalid.",
  "admin.itemNotFoundShort": "This item could not be found.",
  "admin.loadItemFailed":
    "Could not load this item. Check your connection and try again.",
  "admin.missingItemId":
    "This link is missing the item id, so nothing can be loaded.",
  "admin.missingItemIdShort": "This link is missing the item id.",
  "admin.loadItemError": "Failed to load this item",
  "admin.deleteItemFailed": "Could not delete this item.",
  "admin.noEmail": "No email on record",
  "admin.savedBy": "Saved by",
  "admin.collabRequests": "Collab requests",
  "admin.contributions": "Contributions",
  "admin.approved": "Approved",
  "admin.recording": "Recording",
  "admin.approvedContributions": "Approved Contributions",
  "admin.deleting": "Deleting...",
  "admin.deleteItemAction": "Delete Item",
  "admin.deleteItemA11y": "Delete {title} and its linked data",
  "admin.deleteConfirmTitle": "Delete “{title}”?",
  "admin.deleteConfirmBody":
    "This permanently deletes the item and everything linked to it: every saved item, collaboration request, contribution, their notifications, plus the attached photo and recording. This cannot be undone.",
  "admin.cancelDeleteA11y": "Cancel deleting this item",
  "admin.confirmDeleteA11y":
    "Confirm deleting {title} and its linked data",
  "admin.retryItemA11y": "Retry loading this item",
  "admin.goBackListA11y": "Go back to the content list",

  // Content edit
  "admin.editContentHeading": "Edit Cultural Content",
  "admin.editAttributionNamed":
    "This item stays attributed to {name}. Only the text and category can be changed here.",
  "admin.editAttributionGeneric":
    "Only the text and category can be changed here.",
  "admin.titleLabel": "Title",
  "admin.titlePlaceholder": "Enter content title",
  "admin.contentLabel": "Content",
  "admin.contentPlaceholder": "Write your content here...",
  "admin.categoryField": "Category *",
  "admin.selectCategoryHint": "Select one category for this content",
  "admin.titleRequired": "Title is required",
  "admin.contentRequired": "Content is required",
  "admin.selectCategoryError": "Please select a category",
  "admin.inactiveTag": "{label} (inactive)",
  "admin.selectedInactive":
    "{label} is deactivated. You can keep it here or move the content to an active category.",
  "admin.mediaLabel": "Photo and recording",
  "admin.mediaBody":
    "Managed by the item's creator - they stay attached to this item and are not changed by this edit.",
  "admin.saveChanges": "Save Changes",
  "admin.noChanges": "No Changes Yet",
  "admin.saveChangesA11y": "Save the edited cultural content",
  "admin.noChangesA11y": "Nothing has been changed yet",
} as const;

export type AdminKey = keyof typeof enAdmin;

export const siAdmin: Record<AdminKey, string> = {
  // Screen titles
  "admin.title": "පරිපාලක",
  "admin.homeTitle": "පරිපාලක මුල් පිටුව",
  "admin.categoriesTitle": "කාණ්ඩ",
  "admin.usersTitle": "ලියාපදිංචි පරිශීලකයින්",
  "admin.contentTitle": "සංස්කෘතික අන්තර්ගතය",
  "admin.itemTitle": "අයිතමය",
  "admin.editItemTitle": "අයිතමය සංස්කරණය කරන්න",

  // Admin home / dashboard
  "admin.signedInAs": "{name} ලෙස පිවිස ඇත",
  "admin.administrator": "පරිපාලක",
  "admin.contentCategories": "අන්තර්ගත කාණ්ඩ",
  "admin.categoriesCardBody":
    "කාණ්ඩ එකතු කරන්න, සියල්ලන්ට පෙනෙන නාමපාද සංස්කරණය කරන්න, ඒවා අක්‍රිය හෝ නැවත ක්‍රියාත්මක කරන්න. පවතින අන්තර්ගතයේ ගබඩා කර ඇති යතුර කිසිදා වෙනස් නොවේ.",
  "admin.manageCategories": "කාණ්ඩ කළමනාකරණය කරන්න",
  "admin.manageCategoriesA11y": "අන්තර්ගත කාණ්ඩ කළමනාකරණය කරන්න",
  "admin.usersCardBody":
    "සෑම ලියාපදිංචි ගිණුමක්ම බලන්න - නම හෝ විද්‍යුත් තැපෑලෙන් සොයන්න, භූමිකාව අනුව පෙරහන් කරන්න, ගිණුම ලියාපදිංචි වූ දිනය බලන්න. නැරඹීම පමණි.",
  "admin.viewUsers": "ලියාපදිංචි පරිශීලකයින් බලන්න",
  "admin.contentCardBody":
    "සෑම වැඩිහිටියෙකුගේම සංස්කෘතික අයිතම බලන්න - ඒවා සොයා පෙරහන් කරන්න, පරීක්ෂා කිරීමට එකක් විවෘත කරන්න, එහි මාතෘකාව, අන්තර්ගතය හෝ කාණ්ඩය නිවැරදි කරන්න, එයට සම්බන්ධ සියල්ල සමඟම එය මකන්න.",
  "admin.manageContent": "සංස්කෘතික අන්තර්ගතය කළමනාකරණය කරන්න",
  "admin.accessCheckTitle": "ප්‍රවේශ පරීක්ෂාව",
  "admin.accessCheckBody":
    "පරිපාලකයින්ට පමණක් වූ API අංශයකට ඉල්ලීමක් යවයි. වැඩිහිටි සහ තරුණ ගිණුම් සේවාදායකය විසින් ප්‍රතික්ෂේප කරයි.",
  "admin.accessConfirmed": "සේවාදායකය පරිපාලක ප්‍රවේශය තහවුරු කළා.",
  "admin.accessDenied": "පරිපාලක ප්‍රවේශය ප්‍රතික්ෂේප විය.",
  "admin.checking": "පරීක්ෂා කරමින්...",
  "admin.verifyAccess": "පරිපාලක ප්‍රවේශය තහවුරු කරන්න",
  "admin.loggingOut": "ඉවත් වෙමින්...",

  // Dashboard tab (four-tab redesign)
  "admin.dashboardTitle": "පරිපාලක උපකරණ පුවරුව",
  "admin.dashboardSubtitle":
    "සංරක්ෂණ මිම්ම සහ පරිශීලක ඉල්ලීම් පිළිබඳ දළ විශ්ලේෂණය.",
  "admin.dashboardLoadError": "උපකරණ පුවරුව පූරණය කිරීම අසාර්ථකයි",
  "admin.loadingDashboard": "උපකරණ පුවරුව පූරණය වෙමින්...",
  "admin.retryDashboardA11y": "උපකරණ පුවරුව නැවත පූරණය කරන්න",
  "admin.refreshDashboardA11y": "උපකරණ පුවරු දත්ත නැවත යාවත්කාලීන කරන්න",
  "admin.metricTotalUsers": "මුළු පරිශීලකයින්",
  "admin.metricElders": "වැඩිහිටියන්",
  "admin.metricYouth": "තරුණයින්",
  "admin.metricContent": "සංස්කෘතික අන්තර්ගතය",
  "admin.metricTotalUsersA11y":
    "මුළු පරිශීලකයින්: {count}. ලියාපදිංචි පරිශීලකයින් විවෘත කරයි.",
  "admin.metricEldersA11y":
    "වැඩිහිටියන්: {count}. වැඩිහිටියන් ලෙස පෙරහන් කර ලියාපදිංචි පරිශීලකයින් විවෘත කරයි.",
  "admin.metricYouthA11y":
    "තරුණයින්: {count}. තරුණයින් ලෙස පෙරහන් කර ලියාපදිංචි පරිශීලකයින් විවෘත කරයි.",
  "admin.metricContentA11y":
    "සංස්කෘතික අන්තර්ගතය: {count}. සංස්කෘතික අන්තර්ගත කළමනාකරණය විවෘත කරයි.",
  "admin.recentActivity": "මෑත ක්‍රියාකාරකම්",
  "admin.activityEmpty": "තවම මෑත ක්‍රියාකාරකම් නැත.",
  "admin.activityUserRegistered": "නව පරිශීලකයෙකු ලියාපදිංචි විය",
  "admin.activityUserRegisteredDesc": "{name} {role} ලෙස එකතු විය",
  "admin.activityContentAdded": "නව සංස්කෘතික අන්තර්ගතයක් එකතු විය",
  "admin.activityContentAddedDesc": "{title} ඉදිරිපත් කෙරිණි",
  "admin.activityContributionApproved": "දායකත්වය අනුමත කෙරිණි",
  "admin.activityContributionApprovedDesc":
    "{name} විසින් {title} සඳහා දායකත්වය අනුමත කෙරිණි",
  "admin.a11yTabDashboard": "උපකරණ පුවරු පටිය",
  "admin.a11yTabUsers": "පරිශීලක පටිය",
  "admin.a11yTabContents": "අන්තර්ගත පටිය",
  "admin.a11yTabSettings": "සැකසුම් පටිය",

  // Registered users list
  "admin.usersLoading": "ලියාපදිංචි පරිශීලකයින් පූරණය වෙමින්...",
  "admin.usersLoadError": "ලියාපදිංචි පරිශීලකයින් පූරණය කිරීම අසාර්ථකයි",
  "admin.usersLoadMoreError": "තවත් පරිශීලකයින් පූරණය කළ නොහැක.",
  "admin.searchUsersPlaceholder": "නම හෝ විද්‍යුත් තැපෑලෙන් සොයන්න...",
  "admin.searchUsersA11y": "ලියාපදිංචි පරිශීලකයින් නම හෝ විද්‍යුත් තැපෑලෙන් සොයන්න",
  "admin.filterAll": "සියල්ල",
  "admin.roleElder": "වැඩිහිටි",
  "admin.roleYouth": "තරුණ",
  "admin.roleAdmin": "පරිපාලක",
  "admin.roleNone": "භූමිකාවක් නැත",
  "admin.roleFilterA11y": "{label} භූමිකා පෙරහන",
  "admin.emptyUsersFiltered":
    "වත්මන් සෙවීමට සහ භූමිකා පෙරහනට ගැලපෙන ගිණුම් නැත.",
  "admin.emptyUsers": "තවම ලියාපදිංචි පරිශීලකයින් නැත.",
  "admin.clearFilters": "පෙරහන් ඉවත් කරන්න",
  "admin.loadMore": "තවත් පූරණය කරන්න",
  "admin.loadingMore": "තවත් පූරණය වෙමින්...",
  "admin.loadMoreUsersA11y": "ලියාපදිංචි පරිශීලකයින්ගේ ඊළඟ පිටුව පූරණය කරන්න",
  "admin.showingAll": "සියලු {unit} {count} ක් පෙන්වයි",
  "admin.showingOf": "{unit} {total} න් {shown} ක් පෙන්වයි",
  "admin.unitAccountsOne": "ගිණුම",
  "admin.unitAccountsMany": "ගිණුම්",
  "admin.registeredOn": "ලියාපදිංචි වූයේ {date}",
  "admin.registeredDateUnknown": "ලියාපදිංචි දිනය නොදනී",
  "admin.retryUsersA11y": "ලියාපදිංචි පරිශීලකයින් නැවත පූරණය කරන්න",

  // Account status (Active / Disabled)
  "admin.statusActive": "ක්‍රියාත්මකයි",
  "admin.statusDisabled": "අක්‍රියයි",
  "admin.statusFilterA11y": "{label} ගිණුම් තත්ත්ව පෙරහන",
  "admin.accountStatusA11y": "{name} ගිණුමේ තත්ත්වය: {status}",
  "admin.disableAccount": "ගිණුම අක්‍රිය කරන්න",
  "admin.enableAccount": "ගිණුම නැවත ක්‍රියාත්මක කරන්න",
  "admin.disableAccountTitle": "“{name}” ගිණුම අක්‍රිය කරන්ද?",
  "admin.enableAccountTitle": "“{name}” ගිණුම නැවත ක්‍රියාත්මක කරන්ද?",
  "admin.disableAccountBody":
    "ඔහුට පිවිසිය නොහැකි අතර, ඔහුගේ දැනටමත් විවෘත ඇප සැසිය මෙම මොහොතින්ම අඩු කරයි. ඔහුගේ ප්‍රෝෆයල්, සංස්කෘතික අන්තර්ගතය සහ සහයෝගිතා ඉතිහාසය සියල්ලම රකින ලද අතර, ඕනෑම විට ගිණුම නැවත ක්‍රියාත්මක කළ හැක.",
  "admin.enableAccountBody":
    "ඔහුට මෙම මොහොතින්ම නැවත පිවිසිය හැකි අතර, එම ප්‍රෝෆයල්, සංස්කෘතික අන්තර්ගතය සහ සහයෝගිතා ඉතිහාසය නොවෙනස්ව පවතී.",
  "admin.updatingAccount": "යාවත්කාලීන කරමින්...",
  "admin.userStatusUpdateFailed": "මෙම ගිණුම යාවත්කාලීන කළ නොහැක.",
  "admin.disableAccountA11y": "{name} ගිණුම අක්‍රිය කරන්න",
  "admin.enableAccountA11y": "{name} ගිණුම නැවත ක්‍රියාත්මක කරන්න",
  "admin.cancelAccountStatusA11y": "මෙම ගිණුමේ තත්ත්වය වෙනස් කිරීම අවලංගු කරන්න",
  "admin.confirmDisableA11y": "{name} ගිණුම අක්‍රිය කිරීම තහවුරු කරන්න",
  "admin.confirmEnableA11y": "{name} ගිණුම නැවත ක්‍රියාත්මක කිරීම තහවුරු කරන්න",

  // Cultural content list
  "admin.contentLoading": "සංස්කෘතික අන්තර්ගතය පූරණය වෙමින්...",
  "admin.contentLoadError": "සංස්කෘතික අන්තර්ගතය පූරණය කිරීම අසාර්ථකයි",
  "admin.contentLoadMoreError": "තවත් අයිතම පූරණය කළ නොහැක.",
  "admin.searchContentPlaceholder": "මාතෘකාව හෝ අන්තර්ගතය සොයන්න...",
  "admin.searchContentA11y": "සංස්කෘතික අන්තර්ගතය මාතෘකාව හෝ අන්තර්ගතයෙන් සොයන්න",
  "admin.categoryFilterA11y": "{label} කාණ්ඩ පෙරහන",
  "admin.emptyContentFiltered":
    "වත්මන් සෙවීමට සහ කාණ්ඩ පෙරහනට ගැලපෙන අයිතම නැත.",
  "admin.emptyContent": "තවම සංස්කෘතික අන්තර්ගතයක් නැත.",
  "admin.loadMoreContentA11y": "සංස්කෘතික අන්තර්ගතයේ ඊළඟ පිටුව පූරණය කරන්න",
  "admin.unitItemsOne": "අයිතමය",
  "admin.unitItemsMany": "අයිතම",
  "admin.manageCardA11y": "{name} විසින් සාදූ {title} කළමනාකරණය කරන්න",
  "admin.by": "{name} විසින්",
  "admin.createdOn": "සාදන ලද්දේ {date}",
  "admin.updatedOn": "යාවත්කාලීන කළේ {date}",
  "admin.creationDateUnknown": "සෑදූ දිනය නොදනී",
  "admin.retryContentA11y": "සංස්කෘතික අන්තර්ගතය නැවත පූරණය කරන්න",

  // Categories management
  "admin.categoriesIntro":
    "යතුර අන්තර්ගතයේ ගබඩා වන අතර කිසිදා වෙනස් නොවේ. සියල්ලන්ට පෙනෙන්නේ නාමපාදයයි.",
  "admin.addCategory": "කාණ්ඩයක් එකතු කරන්න",
  "admin.keyField": "යතුර *",
  "admin.keyPlaceholder": "උදා: උත්සවය",
  "admin.labelField": "නාමපාදය",
  "admin.labelPlaceholder": "පරිශීලකයින්ට පෙන්වනු ලබන අතර පෙරනිමියෙන් යතුර වේ",
  "admin.keyRequired": "යතුර අවශ්‍යයි",
  "admin.labelRequired": "නාමපාදය අවශ්‍යයි",
  "admin.adding": "එකතු කරමින්...",
  "admin.addCategoryBtn": "කාණ්ඩයක් එකතු කරන්න",
  "admin.allCategories": "සියලු කාණ්ඩ ({count})",
  "admin.emptyCategories": "තවම කාණ්ඩ නැත. ඉහතින් එකක් එකතු කරන්න.",
  "admin.active": "ක්‍රියාත්මකයි",
  "admin.inactive": "අක්‍රියයි",
  "admin.keyStoredOnContent": "යතුර: {key} (අන්තර්ගතයේ ගබඩා කර ඇත)",
  "admin.editLabel": "නාමපාදය සංස්කරණය කරන්න",
  "admin.saving": "සුරකිමින්...",
  "admin.deactivate": "අක්‍රිය කරන්න",
  "admin.reactivate": "නැවත ක්‍රියාත්මක කරන්න",
  "admin.deactivateTitle": "කාණ්ඩය අක්‍රිය කරන්ද?",
  "admin.reactivateTitle": "කාණ්ඩය නැවත ක්‍රියාත්මක කරන්ද?",
  "admin.deactivateBody":
    "අන්තර්ගතයක් සාදන විට හෝ ගෙන යන විට \"{label}\" තවදුරටත් යෝජනා නොකෙරේ. දැනට එය භාවිතා කරන අන්තර්ගතය කියවීමට තවමත් හැකි අතර, සංස්කරණය කරන විට එම කාණ්ඩයම තබා ගත හැක.",
  "admin.reactivateBody":
    "\"{label}\" නැවත අන්තර්ගත කාණ්ඩයක් ලෙස යෝජනා කෙරේ.",
  "admin.categoryCreated": "කාණ්ඩය සාදන ලදී",
  "admin.labelUpdated": "නාමපාදය යාවත්කාලීන කරන ලදී",
  "admin.categoryUpdated": "කාණ්ඩය යාවත්කාලීන කරන ලදී",
  "admin.deleteCategoryTitle": "“{label}” මකන්ද?",
  "admin.deleteCategoryBody":
    "“{label}” කාණ්ඩ ලැයිස්තුවෙන් සදාකට ඉවත් කරනු ලැබේ. මෙය අහෝසි කළ නොහැක, එමඟින් කිසිදු සංස්කෘතික අන්තර්ගතයක් මකනු නොලැබේ. අන්තර්ගතය තවමත් භාවිතා කරන කාණ්ඩයක්, හෝ ගොඩනැමි පෙරනිමි කාණ්ඩයක් අක්‍රිය කිරීමට පමණක් හැකිය.",
  "admin.deleteCategoryFailed": "මෙම කාණ්ඩය මකා දැමිය නොහැක.",
  "admin.categoryDeleted": "කාණ්ඩය මකන ලදී",
  "admin.deleteCategoryA11y": "{label} මකන්න",
  "admin.cancelDeleteCategoryA11y": "මෙම කාණ්ඩය මකීම අවලංගු කරන්න",
  "admin.confirmDeleteCategoryA11y":
    "{label} ස්ථිරව මේරීම තහවුරු කරන්න",

  // Content detail
  "admin.loadingItem": "අයිතමය පූරණය වෙමින්...",
  "admin.itemNotFound":
    "මෙම අයිතමය හමු නොවීය. එය දැනටමත් මකා දමා ඇතිවා හෝ සබැඳිය වලංගු නොවිය හැක.",
  "admin.itemNotFoundShort": "මෙම අයිතමය හමු නොවීය.",
  "admin.loadItemFailed":
    "මෙම අයිතමය පූරණය කළ නොහැක. ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  "admin.missingItemId":
    "මෙම සබැඳියේ අයිතම හැඳුනුම්පත නොමැති නිසා කිසිවක් පූරණය කළ නොහැක.",
  "admin.missingItemIdShort": "මෙම සබැඳියේ අයිතම හැඳුනුම්පත නැත.",
  "admin.loadItemError": "මෙම අයිතමය පූරණය කිරීම අසාර්ථකයි",
  "admin.deleteItemFailed": "මෙම අයිතමය මකා දැමිය නොහැක.",
  "admin.noEmail": "වාර්තාවේ විද්‍යුත් තැපෑලක් නැත",
  "admin.savedBy": "සුරකින ලද්දේ",
  "admin.collabRequests": "සහයෝගිතා ඉල්ලීම්",
  "admin.contributions": "දායකත්ව",
  "admin.approved": "අනුමත",
  "admin.recording": "පටිගත කිරීම",
  "admin.approvedContributions": "අනුමත දායකත්ව",
  "admin.deleting": "මකමින්...",
  "admin.deleteItemAction": "අයිතමය මකන්න",
  "admin.deleteItemA11y": "{title} සහ එයට සම්බන්ධ දත්ත මකන්න",
  "admin.deleteConfirmTitle": "“{title}” මකන්ද?",
  "admin.deleteConfirmBody":
    "මෙය අයිතමය සහ එයට සම්බන්ධ සියල්ල ස්ථිරව මකා දමයි: සුරකින ලද සෑම අයිතමයක්, සහයෝගිතා ඉල්ලීමක්, දායකත්වයක්, ඒවායේ දැනුම්දීම්, එමෙන්ම අමිණු ඇති ඡායාරූපය සහ පටිගත කිරීමද ඇතුළත් වේ. මෙය අහෝසි කළ නොහැක.",
  "admin.cancelDeleteA11y": "මෙම අයිතමය මැකීම අවලංගු කරන්න",
  "admin.confirmDeleteA11y":
    "{title} සහ එයට සම්බන්ධ දත්ත මැකීම තහවුරු කරන්න",
  "admin.retryItemA11y": "මෙම අයිතමය නැවත පූරණය කරන්න",
  "admin.goBackListA11y": "අන්තර්ගත ලැයිස්තුවට ආපසු යන්න",

  // Content edit
  "admin.editContentHeading": "සංස්කෘතික අන්තර්ගතය සංස්කරණය කරන්න",
  "admin.editAttributionNamed":
    "මෙම අයිතමය {name} වෙතම ආරෝපණය වේ. මෙහි වෙනස් කළ හැක්කේ පෙළ සහ කාණ්ඩය පමණි.",
  "admin.editAttributionGeneric":
    "මෙහි වෙනස් කළ හැක්කේ පෙළ සහ කාණ්ඩය පමණි.",
  "admin.titleLabel": "මාතෘකාව",
  "admin.titlePlaceholder": "අන්තර්ගත මාතෘකාව ඇතුළත් කරන්න",
  "admin.contentLabel": "අන්තර්ගතය",
  "admin.contentPlaceholder": "ඔබේ අන්තර්ගතය මෙහි ලියන්න...",
  "admin.categoryField": "කාණ්ඩය *",
  "admin.selectCategoryHint": "මෙම අන්තර්ගතය සඳහා කාණ්ඩයක් තෝරන්න",
  "admin.titleRequired": "මාතෘකාව අවශ්‍යයි",
  "admin.contentRequired": "අන්තර්ගතය අවශ්‍යයි",
  "admin.selectCategoryError": "කරුණාකර කාණ්ඩයක් තෝරන්න",
  "admin.inactiveTag": "{label} (අක්‍රිය)",
  "admin.selectedInactive":
    "{label} අක්‍රිය කර ඇත. ඔබට එය මෙහි තබා ගත හැකි හෝ අන්තර්ගතය ක්‍රියාත්මක කාණ්ඩයකට ගෙන යා හැක.",
  "admin.mediaLabel": "ඡායාරූපය සහ පටිගත කිරීම",
  "admin.mediaBody":
    "අයිතමයේ නිර්මාතෘ විසින් කළමනාකරණය කරයි - ඒවා මෙම අයිතමයට බැඳී පවතින අතර මෙම සංස්කරණයෙන් වෙනස් නොවේ.",
  "admin.saveChanges": "වෙනස්කම් සුරකින්න",
  "admin.noChanges": "තවම වෙනස්කම් නැත",
  "admin.saveChangesA11y": "සංස්කරණය කළ සංස්කෘතික අන්තර්ගතය සුරකින්න",
  "admin.noChangesA11y": "තවම කිසිවක් වෙනස් කර නැත",
};
