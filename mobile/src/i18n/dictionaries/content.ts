/**
 * Content domain: browse/explore/saved/detail/media strings, the shared
 * content card, the public elder profile and profile-photo actions.
 *
 * Only app interface text lives here. User-authored values (titles, bios,
 * contributor names, stored interest values, custom/admin-renamed category
 * labels) are never dictionary keys - they pass through the components
 * untouched, with `translateBuiltin` handling the built-in option lists.
 */

export const enContent = {
  // Browse / Explore (BrowseContentScreen)
  "content.all": "All",
  "content.browseByCategory": "Browse by Category",
  "content.searchKnowledgeA11y": "Search cultural knowledge",
  "content.clearSearch": "Clear search",
  "content.categoryA11y": "{label} category",
  "content.noResultsInCategory": "No results for \"{query}\" in {category}.",
  "content.noResultsFor": "No results for \"{query}\".",
  "content.emptyCategory":
    "No content in {category} yet. Nothing has been shared in this category so far.",
  "content.emptyBrowse": "No cultural content available yet. Check back later!",
  "content.clearFilters": "Clear filters",

  // Saved list (SavedContentScreen)
  "content.savedLoadFailed": "Failed to load your saved content",
  "content.savedEmpty":
    "Nothing saved yet. Open any cultural item and tap Save to keep it here for later.",
  "content.savedLoading": "Loading your saved content...",
  "content.savedRetryA11y": "Retry loading your saved content",

  // Detail (ContentDetailScreen)
  "content.title": "Content",
  "content.notFoundBody":
    "This cultural item could not be found. It may have been deleted, or the link may be invalid.",
  "content.loadFailedBody":
    "Could not load this item. Check your connection and try again.",
  "content.itemNotFound": "This item could not be found.",
  "content.missingId":
    "This link is missing the item id, so nothing can be loaded.",
  "content.contributionsLoadFailed":
    "Community contributions could not be loaded. Check your connection.",
  "content.contributionsLoadFailedShort":
    "Community contributions could not be loaded.",
  "content.saveToggleFailed": "Could not update your saved content.",
  "content.unknownCreator": "Unknown creator",
  "content.unknown": "Unknown",
  "content.tryAgain": "Try Again",
  "content.retryLoadA11y": "Retry loading this item",
  "content.goBack": "Go Back",
  "content.goBackA11y": "Go back to the previous screen",
  "content.sharedOn": "Shared on {date}",
  "content.editedOn": "Edited {date}",
  "content.viewProfileA11y": "View {name}'s profile",
  "content.view": "View",
  "content.recording": "Recording",
  "content.communityContributions": "Community Contributions",
  "content.contribType.translation": "Translation",
  "content.contribType.explanation": "Explanation",
  "content.contribType.transcription": "Transcription",
  "content.contribType.context": "Context",
  "content.byContributor": "By {name}",
  "content.retryContribA11y": "Retry loading community contributions",
  "content.collabRequestA11y": "Request to collaborate on {title}",
  "content.saveA11y": "Save content",
  "content.unsaveA11y": "Unsave content",
  "content.editContent": "Edit Content",
  "content.editContentA11y": "Edit this cultural item",
  "content.deleting": "Deleting...",
  "content.deleteContent": "Delete Content",
  "content.deleteContentA11y": "Delete this cultural item",
  "content.deleteConfirmBody":
    "Are you sure you want to delete this content? This cannot be undone.",
  "content.deleteCancelA11y": "Cancel deleting this item",
  "content.deleteConfirmA11y": "Confirm deleting this item",

  // Public elder profile (ElderProfileScreen)
  "content.elderProfileTitle": "Elder Profile",
  "content.elderNotFound": "Elder not found",
  "content.loadingProfile": "Loading profile...",
  "content.interests": "Interests",
  "content.noInterests": "No cultural interests added yet.",
  "content.culturalItems": "Cultural Items",
  "content.elderNoItems": "No cultural items available from this elder yet.",
  "content.requestCta": "Request ›",
  "content.viewCta": "View ›",

  // Shared card (ContentPreviewCard)
  "content.cardA11y": "View details for {title}",
  "content.sharedBy": "Shared by {name}",

  // Audio playback (AudioClipPlayer)
  "content.audioLoadingA11y": "{title} is loading",
  "content.audioChecking": "Loading {title}...",
  "content.audioTimeout": "This {title} took too long to load.",
  "content.audioMissing": "This {title} could not be found.",
  "content.audioRetry": "Retry loading {title}",
  "content.audioPreparing": "Preparing {title}...",
  "content.audioPlayFailed": "This {title} could not be played.",
  "content.play": "Play",
  "content.pause": "Pause",
  "content.playA11y": "Play {title}",
  "content.pauseA11y": "Pause {title}",
  "content.buffering": "Buffering...",

  // Profile photo actions (ProfilePhotoSection)
  "content.photoUploadFailed": "Photo upload failed. Please try again.",
  "content.photoRemoveFailed": "Failed to remove photo.",
  "content.removePhotoTitle": "Remove photo?",
  "content.removePhotoBody":
    "Your profile will show your initials instead.",
  "content.uploading": "Uploading...",
  "content.uploadingPercent": "Uploading... {percent}%",
  "content.removing": "Removing...",
  "content.addPhoto": "Add Photo",
  "content.changePhoto": "Change Photo",
  "content.removePhoto": "Remove Photo",
  "content.addPhotoA11y": "Add photo",
  "content.changePhotoA11y": "Change photo",
  "content.addProfilePhotoA11y": "Add profile photo",
  "content.changeProfilePhotoA11y": "Change profile photo",
  "content.removePhotoA11y": "Remove photo",
  "content.retryPhotoUploadA11y": "Retry photo upload",
  "content.continueWithoutPhoto": "Continue Without Photo",
  "content.continueWithoutPhotoA11y": "Continue without a profile photo",
  "content.photoOnboardingCaption":
    "Your photo saves immediately - or finish setup without one.",
  "content.photoEditCaption":
    "Photo changes save immediately. Other edits save with \"Save Changes\".",

  // Image picker validation (src/utils/contentImage.ts)
  "content.pickPermissionDenied":
    "Photo access is required to choose an image. Enable it in your device settings.",
  "content.pickOpenFailed":
    "Could not open the image picker. Please try again.",
  "content.pickEmptyFile": "That file is empty. Please choose another image.",
  "content.pickTooLarge":
    "That image is {size}. The maximum size is {max} MB - please pick a smaller one.",
} as const;

export type ContentKey = keyof typeof enContent;

export const siContent: Record<ContentKey, string> = {
  // Browse / Explore
  "content.all": "සියල්ල",
  "content.browseByCategory": "කාණ්ඩ අනුව සොයා බලන්න",
  "content.searchKnowledgeA11y": "සංස්කෘතික දැනුම සොයන්න",
  "content.clearSearch": "සොයීම හිස් කරන්න",
  "content.categoryA11y": "{label} කාණ්ඩය",
  "content.noResultsInCategory": "{category} තුළ \"{query}\" සඳහා ප්‍රතිඵල නැත.",
  "content.noResultsFor": "\"{query}\" සඳහා ප්‍රතිඵල නැත.",
  "content.emptyCategory":
    "{category} කාණ්ඩයේ තවම අන්තර්ගතයක් නැත. මෙම කාණ්ඩයට මේ දක්වා කිසිවක් බෙදා දී නැත.",
  "content.emptyBrowse":
    "තවම සංස්කෘතික අන්තර්ගතයක් නැත. පසුව නැවත පරීක්ෂා කරන්න!",
  "content.clearFilters": "පෙරහන් හිස් කරන්න",

  // Saved list
  "content.savedLoadFailed": "ඔබේ සුරකින ලද අන්තර්ගතය පූරණය කිරීම අසාර්ථකයි",
  "content.savedEmpty":
    "තවම කිසිවක් සුරකින්නට නැත. පසුව භාවිතා කිරීමට ඕනෑම සංස්කෘතික අයිතමයක් විවෘත කර මෙහි තබා ගැනීමට සුරකින්න ඔබන්න.",
  "content.savedLoading": "ඔබේ සුරකින ලද අන්තර්ගතය පූරණය වෙමින්...",
  "content.savedRetryA11y": "ඔබේ සුරකින ලද අන්තර්ගතය නැවත පූරණය කරන්න",

  // Detail
  "content.title": "අන්තර්ගතය",
  "content.notFoundBody":
    "මෙම සංස්කෘතික අයිතමය හමු නොවීය. එය මකා දමා ඇති හෝ සබැඳිය වැරදි විය හැක.",
  "content.loadFailedBody":
    "මෙම අයිතමය පූරණය කළ නොහැක. ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  "content.itemNotFound": "මෙම අයිතමය හමු නොවීය.",
  "content.missingId":
    "මෙම සබැඳියට අයිතම අංකය නොමැති නිසා කිසිවක් පූරණය කළ නොහැක.",
  "content.contributionsLoadFailed":
    "ප්‍රජා දායකත්ව පූරණය කළ නොහැක. ඔබේ සම්බන්ධතාව පරීක්ෂා කරන්න.",
  "content.contributionsLoadFailedShort":
    "ප්‍රජා දායකත්ව පූරණය කළ නොහැක.",
  "content.saveToggleFailed": "ඔබේ සුරකින ලද අන්තර්ගතය යාවත්කාලීන කළ නොහැක.",
  "content.unknownCreator": "නොදන්නා නිර්මාතෘ",
  "content.unknown": "නොදන්නා",
  "content.tryAgain": "නැවත උත්සාහ කරන්න",
  "content.retryLoadA11y": "මෙම අයිතමය නැවත පූරණය කරන්න",
  "content.goBack": "ආපසු යන්න",
  "content.goBackA11y": "පෙර තිරයට ආපසු යන්න",
  "content.sharedOn": "{date} දින බෙදා දුන්නේය",
  "content.editedOn": "{date} දින සංස්කරණය කළේය",
  "content.viewProfileA11y": "{name}ගේ ප්‍රොෆයිල් බලන්න",
  "content.view": "බලන්න",
  "content.recording": "රෙකෝඩිං",
  "content.communityContributions": "ප්‍රජා දායකත්ව",
  "content.contribType.translation": "පරිවර්තනය",
  "content.contribType.explanation": "පැහැදිලි කිරීම",
  "content.contribType.transcription": "පිටපත් කිරීම",
  "content.contribType.context": "සන්දර්භය",
  "content.byContributor": "{name} විසින්",
  "content.retryContribA11y": "ප්‍රජා දායකත්ව නැවත පූරණය කරන්න",
  "content.collabRequestA11y": "{title} සඳහා සහයෝගිතාවක් ඉල්ලන්න",
  "content.saveA11y": "අන්තර්ගතය සුරකින්න",
  "content.unsaveA11y": "සුරකින ලද අන්තර්ගතය ඉවත් කරන්න",
  "content.editContent": "අන්තර්ගතය සංස්කරණය කරන්න",
  "content.editContentA11y": "මෙම සංස්කෘතික අයිතමය සංස්කරණය කරන්න",
  "content.deleting": "මකමින්...",
  "content.deleteContent": "අන්තර්ගතය මකන්න",
  "content.deleteContentA11y": "මෙම සංස්කෘතික අයිතමය මකන්න",
  "content.deleteConfirmBody":
    "ඔබ මෙම අන්තර්ගතය මකා දැමීමට අවශ්‍ය බව විශ්වාසද? මෙය ආපසු හැරවිය නොහැක.",
  "content.deleteCancelA11y": "මෙම අයිතමය මැකීම අවලංගු කරන්න",
  "content.deleteConfirmA11y": "මෙම අයිතමය මැකීම තහවුරු කරන්න",

  // Public elder profile
  "content.elderProfileTitle": "වැඩිහිටි ප්‍රොෆයිල්",
  "content.elderNotFound": "වැඩිහිටියා හමු නොවීය",
  "content.loadingProfile": "ප්‍රොෆයිල් පූරණය වෙමින්...",
  "content.interests": "අභිලාෂ",
  "content.noInterests": "තවම සංස්කෘතික අභිලාෂ එකතු කර නැත.",
  "content.culturalItems": "සංස්කෘතික අයිතම",
  "content.elderNoItems": "තවම මෙම වැඩිහිටියාගේ සංස්කෘතික අයිතම නැත.",
  "content.requestCta": "ඉල්ලන්න ›",
  "content.viewCta": "බලන්න ›",

  // Shared card
  "content.cardA11y": "{title} හි විස්තර බලන්න",
  "content.sharedBy": "{name} විසින් බෙදා දුන්නේය",

  // Audio playback
  "content.audioLoadingA11y": "{title} පූරණය වෙමින්",
  "content.audioChecking": "{title} පූරණය වෙමින්...",
  "content.audioTimeout": "මෙම {title} පූරණය වීමට ඉතා වැඩි කාලයක් ගියා.",
  "content.audioMissing": "මෙම {title} හමු නොවීය.",
  "content.audioRetry": "{title} නැවත පූරණය කරන්න",
  "content.audioPreparing": "{title} සූදානම් කරමින්...",
  "content.audioPlayFailed": "මෙම {title} වාදනය කළ නොහැක.",
  "content.play": "ධාවනය කරන්න",
  "content.pause": "විරාමය දෙන්න",
  "content.playA11y": "{title} ධාවනය කරන්න",
  "content.pauseA11y": "{title} විරාමය දෙන්න",
  "content.buffering": "බෆර් වෙමින්...",

  // Profile photo actions
  "content.photoUploadFailed": "ඡායාරූපය උඩගැනීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
  "content.photoRemoveFailed": "ඡායාරූපය ඉවත් කිරීම අසාර්ථකයි.",
  "content.removePhotoTitle": "ඡායාරූපය ඉවත් කරන්ද?",
  "content.removePhotoBody":
    "ඒ වෙනුවට ඔබේ ප්‍රොෆයිල්හි ඔබේ අකුරු පමණක් පෙන්වනු ඇත.",
  "content.uploading": "උඩගැනීමෙන්...",
  "content.uploadingPercent": "උඩගැනීමෙන්... {percent}%",
  "content.removing": "ඉවත් කරමින්...",
  "content.addPhoto": "ඡායාරූපයක් එකතු කරන්න",
  "content.changePhoto": "ඡායාරූපය වෙනස් කරන්න",
  "content.removePhoto": "ඡායාරූපය ඉවත් කරන්න",
  "content.addPhotoA11y": "ඡායාරූපයක් එකතු කරන්න",
  "content.changePhotoA11y": "ඡායාරූපය වෙනස් කරන්න",
  "content.addProfilePhotoA11y": "ප්‍රොෆයිල් ඡායාරූපයක් එකතු කරන්න",
  "content.changeProfilePhotoA11y": "ප්‍රොෆයිල් ඡායාරූපය වෙනස් කරන්න",
  "content.removePhotoA11y": "ඡායාරූපය ඉවත් කරන්න",
  "content.retryPhotoUploadA11y": "ඡායාරූප උඩගැනීම නැවත උත්සාහ කරන්න",
  "content.continueWithoutPhoto": "ඡායාරූපයකින් තොරව ඉදිරියට යන්න",
  "content.continueWithoutPhotoA11y": "ප්‍රොෆයිල් ඡායාරූපයකින් තොරව ඉදිරියට යන්න",
  "content.photoOnboardingCaption":
    "ඔබේ ඡායාරූපය ක්ෂණිකව සුරැකේ - නැතහොත් එයින් තොරව සැකසුම සම්පූර්ණ කරන්න.",
  "content.photoEditCaption":
    "ඡායාරූප වෙනස්කම් ක්ෂණිකව සුරැකේ. අනෙකුත් වෙනස්කම් \"වෙනස්කම් සුරකින්න\" බොත්තම සමඟ සුරැකේ.",

  // Image picker validation (src/utils/contentImage.ts)
  "content.pickPermissionDenied":
    "රූපයක් තෝරීමට ඡායාරූප ප්‍රවේශය අවශ්‍යයි. උපකරණයේ සැකසුම් වලින් එය සක්‍රීය කරන්න.",
  "content.pickOpenFailed":
    "රූප තේරුම්ගන්නාය විවෘත කළ නොහැක. නැවත උත්සාහ කරන්න.",
  "content.pickEmptyFile": "ෆයිලය හිස්ය. වෙනත් එකක් තෝරන්න.",
  "content.pickTooLarge":
    "එම රූපය {size} වේ. උපරිම ප්‍රමාණය {max} MB ය - කුඩා එකක් තෝරන්න.",
};
