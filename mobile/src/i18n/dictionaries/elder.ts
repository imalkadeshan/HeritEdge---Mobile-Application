/**
 * Elder domain dictionary: strings owned by the Elder routes
 * (My Content, Create/Edit Content, Collaboration Workspace and the elder
 * tab bar accessibility labels).
 *
 * Shared actions/states live in common.* / home.* / nav.* and are reused at
 * the call sites instead of being redefined here (Retry, Cancel, Delete,
 * Done, connection errors, loading categories, ...). Category labels are
 * resolved through useCategoryLabel -> category.* so stored category keys
 * are never rewritten; user-authored content (titles, bios, contribution
 * text, custom category labels) is never passed through this dictionary.
 */

export const enElder = {
  // Shared content form (create + edit)
  "elder.shareKnowledge": "Share Knowledge",
  "elder.fieldTitle": "Title",
  "elder.fieldTitlePlaceholder": "Enter content title",
  "elder.fieldContent": "Content",
  "elder.fieldContentPlaceholder": "Write your content here...",
  "elder.titleRequired": "Title is required",
  "elder.contentRequired": "Content is required",
  "elder.selectCategory": "Please select a category",
  "elder.categoryHeading": "Category *",
  "elder.categoryHint": "Select one category for your content",
  "elder.noCategories": "No categories available yet.",
  "elder.inactiveCategoryLabel": "{category} (inactive)",
  "elder.categoryDeactivated":
    "{label} is deactivated. You can keep it here or move the content to an active category.",

  // Create content
  "elder.createTitle": "Create Content",
  "elder.createHeading": "Share Your Knowledge",
  "elder.createSubtitle":
    "Contribute to the community by sharing cultural knowledge.",
  "elder.createSaveFailed": "Could not save your content. Please try again.",
  "elder.createSavedNoId": "Your content was saved, but something went wrong.",
  "elder.createUpdateFailed":
    "Your content could not be updated. Please try again.",
  "elder.createNoticePhoto":
    "Your content \"{title}\" was saved, but its photo was not uploaded. It is already in your list - retry below or finish without it.",
  "elder.createNoticeAudio":
    "Your content \"{title}\" was saved, but its recording was not uploaded. It is already in your list - retry below or finish without it.",
  "elder.createNoticeBoth":
    "Your content \"{title}\" was saved, but these were not uploaded. It is already in your list - retry below or finish without them.",

  // Media: photo
  "elder.photoSectionOptional": "Photo (optional)",
  "elder.photoSection": "Photo",
  "elder.photoHintCreate":
    "A picture that goes with your content. JPEG, PNG, GIF or WebP, up to {max} MB.",
  "elder.photoHintEdit": "JPEG, PNG, GIF or WebP, up to {max} MB.",
  "elder.choosePhoto": "Choose photo",
  "elder.changePhoto": "Change photo",
  "elder.removePhoto": "Remove photo",
  "elder.loadingPhoto": "Loading photo...",
  "elder.noPhotoYet": "No photo yet.",
  "elder.imageUploadFailed": "The image could not be uploaded.",
  "elder.imageUploadConnection":
    "Could not upload the image. Check your connection and try again.",
  "elder.imageRemoveFailed": "The image could not be removed.",

  // Media: audio recording
  "elder.audioSectionOptional": "Audio (optional)",
  "elder.audioSection": "Audio",
  "elder.audioHintCreate":
    "Record yourself speaking your content. Up to {max} MB (about {minutes} minutes).",
  "elder.audioHintEdit":
    "Record yourself speaking. Up to {max} MB (about {minutes} minutes).",
  "elder.startRecording": "Start recording",
  "elder.startRecordingA11y": "Start recording audio",
  "elder.stopRecording": "Stop recording",
  "elder.recordAgain": "Record again",
  "elder.starting": "Starting…",
  "elder.stopping": "Stopping…",
  "elder.recordingElapsed": "Recording… {duration}",
  "elder.noRecording": "No recording yet.",
  "elder.loadingRecording": "Loading recording...",
  "elder.recordingTitle": "Recording",
  "elder.newRecordingTitle": "New recording",
  "elder.uploadedWhenShare": "Uploaded when you share.",
  "elder.takeNotUploaded": "This take has not been uploaded yet.",
  "elder.discardRecording": "Discard recording",
  "elder.discardRecordingA11y": "Discard the current recording",
  "elder.discardNewRecordingA11y": "Discard the new recording",
  "elder.uploadRecording": "Upload recording",
  "elder.uploadRecordingA11y": "Upload the new recording",
  "elder.audioUploadFailed": "The recording could not be uploaded.",
  "elder.audioUploadConnection":
    "Could not upload the recording. Check your connection and try again.",
  "elder.audioRemoveFailed": "The recording could not be removed.",
  "elder.stopBeforeSubmit":
    "Stop recording before sharing your content.",

  // Upload / save progress
  "elder.uploading": "Uploading…",
  "elder.uploadingPct": "Uploading… {percent}%",
  "elder.uploadingPhoto": "Uploading photo…",
  "elder.uploadingPhotoPct": "Uploading photo… {percent}%",
  "elder.uploadingAudio": "Uploading audio…",
  "elder.uploadingAudioPct": "Uploading audio… {percent}%",
  "elder.saving": "Saving...",
  "elder.uploadMedia": "Upload media",
  "elder.retrying": "Retrying…",
  "elder.retryUpload": "Retry upload",
  "elder.retryUploadA11y": "Retry uploading the pending media",
  "elder.finishWithoutMedia": "Finish without media",
  "elder.finishWithoutMediaA11y":
    "Finish without uploading the pending media",
  "elder.removing": "Removing...",

  // Edit content
  "elder.editTitle": "Edit Content",
  "elder.editHeading": "Edit Your Content",
  "elder.editSubtitle": "Update your shared cultural knowledge.",
  "elder.saveChanges": "Save Changes",
  "elder.deleting": "Deleting...",
  "elder.deleteContent": "Delete Content",
  "elder.deleteConfirm":
    "Are you sure you want to delete this content? This cannot be undone.",
  "elder.removePhotoTitle": "Remove Photo",
  "elder.removePhotoConfirm":
    "Remove the photo from this content? The content itself stays listed.",
  "elder.keepPhoto": "Keep Photo",
  "elder.removeAudio": "Remove audio",
  "elder.removeAudioTitle": "Remove Audio",
  "elder.removeAudioConfirm":
    "Remove the recording from this content? The content itself stays listed.",
  "elder.removeAudioA11y": "Remove the stored recording",
  "elder.keepRecording": "Keep Recording",

  // My Content tab
  "elder.myContentLoading": "Loading your content...",
  "elder.myContentLoadFailed": "Failed to load your content",
  "elder.myContentEmpty":
    "You haven't shared anything yet. Tap \"+ Share Knowledge\" to contribute your first item.",

  // Collaboration workspace
  "elder.collaborationTitle": "Collaboration",
  "elder.workspaceLoading": "Loading workspace...",
  "elder.noCollaboration": "No collaboration specified",
  "elder.workspaceLoadFailed": "Failed to load workspace",
  "elder.workspaceUnavailable": "Workspace not available.",
  "elder.backToRequests": "Back to Requests",
  "elder.approveFailed": "Failed to approve contribution",
  "elder.requestChangesFailed": "Failed to request changes",

  // Elder tab bar accessibility labels
  "elder.a11yTabHome": "Home tab",
  "elder.a11yTabExplore": "Explore tab",
  "elder.a11yTabMyContent": "My Content tab",
  "elder.a11yTabCollaborate": "Collaborate tab",
  "elder.a11yTabProfile": "Profile tab",

  // Audio recorder errors (useContentRecorder)
  "elder.recorderPermission":
    "Microphone access is needed to record. Allow it in your device settings, then try again.",
  "elder.recorderStartFailed": "Could not start recording. Please try again.",
  "elder.recorderSaveFailed": "The recording could not be saved. Please try again.",
  "elder.recorderTooLong":
    "Recordings are limited to {minutes} minutes. Please record a shorter clip.",
  "elder.recorderStopFailed": "Could not stop the recording. Please try again.",
} as const;

export type ElderKey = keyof typeof enElder;

export const siElder: Record<ElderKey, string> = {
  // Shared content form (create + edit)
  "elder.shareKnowledge": "දැනුම බෙදා දෙන්න",
  "elder.fieldTitle": "මාතෘකාව",
  "elder.fieldTitlePlaceholder": "අන්තර්ගත මාතෘකාව ඇතුළත් කරන්න",
  "elder.fieldContent": "අන්තර්ගතය",
  "elder.fieldContentPlaceholder": "ඔබේ අන්තර්ගතය මෙහි ලියන්න...",
  "elder.titleRequired": "මාතෘකාව අවශ්‍යයි",
  "elder.contentRequired": "අන්තර්ගතය අවශ්‍යයි",
  "elder.selectCategory": "කරුණාකර කාණ්ඩයක් තෝරන්න",
  "elder.categoryHeading": "කාණ්ඩය *",
  "elder.categoryHint": "ඔබේ අන්තර්ගතය සඳහා එක් කාණ්ඩයක් තෝරන්න",
  "elder.noCategories": "තවම කාණ්ඩ නැත.",
  "elder.inactiveCategoryLabel": "{category} (ක්‍රියාවිරහිත)",
  "elder.categoryDeactivated":
    "{label} ක්‍රියාවිරහිතයි. ඔබට එය මෙහි තබා ගත හැකියහෝ අන්තර්ගතය ක්‍රියාත්මක කාණ්ඩයකට ගෙන යා හැකිය.",

  // Create content
  "elder.createTitle": "අන්තර්ගතය සාදන්න",
  "elder.createHeading": "ඔබේ දැනුම බෙදා දෙන්න",
  "elder.createSubtitle":
    "සංස්කෘතික දැනුම බෙදා දීමෙන් ප්‍රජාවට දායක වන්න.",
  "elder.createSaveFailed":
    "ඔබේ අන්තර්ගතය සුරකිය නොහැකි විය. නැවත උත්සාහ කරන්න.",
  "elder.createSavedNoId":
    "ඔබේ අන්තර්ගතය සුරකින ලදී, නමුත් යමක් වැරදියි.",
  "elder.createUpdateFailed":
    "ඔබේ අන්තර්ගතය යාවත්කාලීන කළ නොහැකි විය. නැවත උත්සාහ කරන්න.",
  "elder.createNoticePhoto":
    "ඔබේ \"{title}\" අන්තර්ගතය සුරකින ලදී, නමුත් එහි ඡායාරූපය උඩුගත වී නැත. එය දැනටමත් ඔබේ ලැයිස්තුවේ ඇත - පහතින් නැවත උත්සාහ කරන්නහෝ එයින් තොරව අවසන් කරන්න.",
  "elder.createNoticeAudio":
    "ඔබේ \"{title}\" අන්තර්ගතය සුරකින ලදී, නමුත් එහි වාර්තාව උඩුගත වී නැත. එය දැනටමත් ඔබේ ලැයිස්තුවේ ඇත - පහතින් නැවත උත්සාහ කරන්නහෝ එයින් තොරව අවසන් කරන්න.",
  "elder.createNoticeBoth":
    "ඔබේ \"{title}\" අන්තර්ගතය සුරකින ලදී, නමුත් ඒවා උඩුගත වී නැත. ඒවා දැනටමත් ඔබේ ලැයිස්තුවේ ඇත - පහතින් නැවත උත්සාහ කරන්නහෝ ඒවා නොමැතිව අවසන් කරන්න.",

  // Media: photo
  "elder.photoSectionOptional": "ඡායාරූපය (අවශ්‍ය නැත)",
  "elder.photoSection": "ඡායාරූපය",
  "elder.photoHintCreate":
    "ඔබේ අන්තර්ගතයට ගැලපෙන රූපයක්. JPEG, PNG, GIF හෝ WebP, උපරිම {max} MB.",
  "elder.photoHintEdit": "JPEG, PNG, GIF හෝ WebP, උපරිම {max} MB.",
  "elder.choosePhoto": "ඡායාරූපය තෝරන්න",
  "elder.changePhoto": "ඡායාරූපය වෙනස් කරන්න",
  "elder.removePhoto": "ඡායාරූපය ඉවත් කරන්න",
  "elder.loadingPhoto": "ඡායාරූපය පූරණය වෙමින්...",
  "elder.noPhotoYet": "තවම ඡායාරූපයක් නැත.",
  "elder.imageUploadFailed": "ඡායාරූපය උඩුගත කළ නොහැකි විය.",
  "elder.imageUploadConnection":
    "ඡායාරූපය උඩුගත කළ නොහැකි විය. ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  "elder.imageRemoveFailed": "ඡායාරූපය ඉවත් කළ නොහැකි විය.",

  // Media: audio recording
  "elder.audioSectionOptional": "ශබ්දය (අවශ්‍ය නැත)",
  "elder.audioSection": "ශබ්දය",
  "elder.audioHintCreate":
    "ඔබේ අන්තර්ගතය කියමින් වාර්තා කරන්න. උපරිම {max} MB (ආසන්න විනාඩි {minutes} ක්).",
  "elder.audioHintEdit":
    "ඔබ කතා කරමින් වාර්තා කරන්න. උපරිම {max} MB (ආසන්න විනාඩි {minutes} ක්).",
  "elder.startRecording": "වාර්තා කිරීම ආරම්භ කරන්න",
  "elder.startRecordingA11y": "ශබ්ද වාර්තාව ආරම්භ කරන්න",
  "elder.stopRecording": "වාර්තා කිරීම නවත්වන්න",
  "elder.recordAgain": "නැවත වාර්තා කරන්න",
  "elder.starting": "ආරම්භ වෙමින්...",
  "elder.stopping": "නවත්වමින්...",
  "elder.recordingElapsed": "වාර්තා වෙමින්... {duration}",
  "elder.noRecording": "තවම වාර්තාවක් නැත.",
  "elder.loadingRecording": "වාර්තාව පූරණය වෙමින්...",
  "elder.recordingTitle": "වාර්තාව",
  "elder.newRecordingTitle": "නව වාර්තාව",
  "elder.uploadedWhenShare": "බෙදා දෙන විට උඩුගත වේ.",
  "elder.takeNotUploaded": "මෙම වාර්තාව තවම උඩුගත කර නැත.",
  "elder.discardRecording": "වාර්තාව අත්හැර දමන්න",
  "elder.discardRecordingA11y": "වත්මන් වාර්තාව අත්හැර දමන්න",
  "elder.discardNewRecordingA11y": "නව වාර්තාව අත්හැර දමන්න",
  "elder.uploadRecording": "වාර්තාව උඩුගත කරන්න",
  "elder.uploadRecordingA11y": "නව වාර්තාව උඩුගත කරන්න",
  "elder.audioUploadFailed": "වාර්තාව උඩුගත කළ නොහැකි විය.",
  "elder.audioUploadConnection":
    "වාර්තාව උඩුගත කළ නොහැකි විය. ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  "elder.audioRemoveFailed": "වාර්තාව ඉවත් කළ නොහැකි විය.",
  "elder.stopBeforeSubmit":
    "ඔබේ අන්තර්ගතය බෙදා දීමට පෙර වාර්තා කිරීම නවත්වන්න.",

  // Upload / save progress
  "elder.uploading": "උඩුගත වෙමින්...",
  "elder.uploadingPct": "උඩුගත වෙමින්... {percent}%",
  "elder.uploadingPhoto": "ඡායාරූපය උඩුගත වෙමින්...",
  "elder.uploadingPhotoPct": "ඡායාරූපය උඩුගත වෙමින්... {percent}%",
  "elder.uploadingAudio": "ශබ්දය උඩුගත වෙමින්...",
  "elder.uploadingAudioPct": "ශබ්දය උඩුගත වෙමින්... {percent}%",
  "elder.saving": "සුරකිමින්...",
  "elder.uploadMedia": "මාධ්‍ය උඩුගත කරන්න",
  "elder.retrying": "නැවත උත්සාහ කරමින්...",
  "elder.retryUpload": "උඩුගත කිරීම නැවත උත්සාහ කරන්න",
  "elder.retryUploadA11y": "බලාපොරොත්තු මාධ්‍ය නැවත උඩුගත කරන්න",
  "elder.finishWithoutMedia": "මාධ්‍යයෙන් තොරව අවසන් කරන්න",
  "elder.finishWithoutMediaA11y":
    "බලාපොරොත්තු මාධ්‍ය උඩුගත නොකර අවසන් කරන්න",
  "elder.removing": "ඉවත් කරමින්...",

  // Edit content
  "elder.editTitle": "අන්තර්ගතය සංස්කරණය කරන්න",
  "elder.editHeading": "ඔබේ අන්තර්ගතය සංස්කරණය කරන්න",
  "elder.editSubtitle": "ඔබ බෙදා ඇති සංස්කෘතික දැනුම යාවත්කාලීන කරන්න.",
  "elder.saveChanges": "වෙනස්කම් සුරකින්න",
  "elder.deleting": "මකමින්...",
  "elder.deleteContent": "අන්තර්ගතය මකන්න",
  "elder.deleteConfirm":
    "ඔබට මෙම අන්තර්ගතය මකා දැමීමට අවශ්‍යද? මෙය ආපසු හැරවිය නොහැක.",
  "elder.removePhotoTitle": "ඡායාරූපය ඉවත් කරන්න",
  "elder.removePhotoConfirm":
    "මෙම අන්තර්ගතයෙන් ඡායාරූපය ඉවත් කරන්ද? අන්තර්ගතයම ලැයිස්තුවේ පවතී.",
  "elder.keepPhoto": "ඡායාරූපය තබා ගන්න",
  "elder.removeAudio": "ශබ්දය ඉවත් කරන්න",
  "elder.removeAudioTitle": "ශබ්දය ඉවත් කරන්න",
  "elder.removeAudioConfirm":
    "මෙම අන්තර්ගතයෙන් වාර්තාව ඉවත් කරන්ද? අන්තර්ගතයම ලැයිස්තුවේ පවතී.",
  "elder.removeAudioA11y": "සුරැකි වාර්තාව ඉවත් කරන්න",
  "elder.keepRecording": "වාර්තාව තබා ගන්න",

  // My Content tab
  "elder.myContentLoading": "ඔබේ අන්තර්ගතය පූරණය වෙමින්...",
  "elder.myContentLoadFailed": "ඔබේ අන්තර්ගතය පූරණය කිරීම අසාර්ථකයි",
  "elder.myContentEmpty":
    "ඔබ තවම කිසිවක් බෙදා දී නැත. ඔබේ පළමු අයිතමය දායක කිරීමට \"+ දැනුම බෙදා දෙන්න\" ඔබන්න.",

  // Collaboration workspace
  "elder.collaborationTitle": "සහයෝගිතාව",
  "elder.workspaceLoading": "වැඩබිම පූරණය වෙමින්...",
  "elder.noCollaboration": "සඳහන් කර ඇති සහයෝගිතාවක් නැත",
  "elder.workspaceLoadFailed": "වැඩබිම පූරණය කිරීම අසාර්ථකයි",
  "elder.workspaceUnavailable": "වැඩබිම නොමැත.",
  "elder.backToRequests": "ඉල්ලීම් වෙත ආපසු",
  "elder.approveFailed": "දායකත්වය අනුමත කිරීම අසාර්ථකයි",
  "elder.requestChangesFailed": "වෙනස්කම් ඉල්ලීම අසාර්ථකයි",

  // Elder tab bar accessibility labels
  "elder.a11yTabHome": "මුල් පිටු ටැබ් එක",
  "elder.a11yTabExplore": "සොයා බැලීමේ ටැබ් එක",
  "elder.a11yTabMyContent": "මගේ අන්තර්ගත ටැබ් එක",
  "elder.a11yTabCollaborate": "සහයෝග ටැබ් එක",
  "elder.a11yTabProfile": "ප්‍රොෆයිල් ටැබ් එක",

  // Audio recorder errors (useContentRecorder)
  "elder.recorderPermission":
    "පටිගත කිරීමට මයික්‍රොෆෝන ප්‍රවේශය අවශ්‍යයි. උපකරණයේ සැකසුම් වලින් එය ඉඩ දී නැවත උත්සාහ කරන්න.",
  "elder.recorderStartFailed": "පටිගත කිරීම ආරම්භ කළ නොහැක. නැවත උත්සාහ කරන්න.",
  "elder.recorderSaveFailed": "පටිගත කිරීම සුරැකිය නොහැක. නැවත උත්සාහ කරන්න.",
  "elder.recorderTooLong":
    "පටිගත කිරීම් මිනිත්තු {minutes} කින් සීමා වේ. කෙටි පටිගත කිරීමක් කරන්න.",
  "elder.recorderStopFailed": "පටිගත කිරීම නතර කළ නොහැක. නැවත උත්සාහ කරන්න.",
};
