/**
 * API error-code dictionary.
 *
 * Every key is `api.<CODE>` and matches the additive `code` field the backend
 * attaches to a failure payload (`{ success: false, message, code }`). The
 * backend `message` stays the English fallback used when a code is missing or
 * unknown to this table (see src/i18n/apiError.ts).
 *
 * CONVENTION: a value is a complete, user-facing sentence - the UI shows it
 * instead of the raw server message, so it must stand on its own. No
 * placeholders are used: the codes are stable identifiers and the message they
 * replace already carries every concrete detail the user needs.
 *
 * Grouped the same way the backend emits them: generic failures, auth/token,
 * password, field validation, request/query parameters, content, collaboration,
 * contribution, categories, uploads.
 */

export const enApi = {
  // ---- Generic ----
  "api.SERVER_ERROR": "Something went wrong. Please try again.",
  "api.NOT_FOUND": "That item could not be found.",
  "api.FORBIDDEN": "You do not have permission to do that.",
  "api.DUPLICATE": "You already have a pending or accepted request for this content.",
  "api.RATE_LIMITED": "Too many attempts. Please wait a few minutes and try again.",

  // ---- Authentication / session ----
  "api.AUTH_REQUIRED": "Please sign in to continue.",
  "api.AUTH_MISSING_TOKEN": "Your session is missing. Please sign in again.",
  "api.AUTH_INVALID_TOKEN": "Your session is no longer valid. Please sign in again.",
  "api.AUTH_TOKEN_EXPIRED": "Your session has expired. Please sign in again.",
  "api.AUTH_TOKEN_REVOKED": "Your session was ended. Please sign in again.",
  "api.AUTH_INVALID_CREDENTIALS": "Email or password is incorrect.",
  "api.ACCOUNT_DISABLED":
    "This account has been disabled. Please contact an administrator.",
  "api.AUTH_EMAIL_EXISTS": "An account with this email already exists.",

  // ---- Passwords ----
  "api.PASSWORD_REQUIRED": "Password is required.",
  "api.PASSWORD_CURRENT_INCORRECT": "Your current password is incorrect.",
  "api.PASSWORD_POLICY": "Password must be at least 6 characters.",
  "api.PASSWORD_UNCHANGED": "New password must be different from your current password.",
  "api.PASSWORD_WEAK": "Password must be at least 6 characters.",

  // ---- Field validation ----
  "api.EMAIL_REQUIRED": "Email is required.",
  "api.EMAIL_INVALID": "Please enter a valid email address.",
  "api.NAME_REQUIRED": "Name is required.",
  "api.NAME_TOO_SHORT": "Name must be at least 2 characters.",
  "api.ROLE_REQUIRED": "Please choose a role.",
  "api.ROLE_INVALID": "Role must be either elder or youth.",

  // ---- Request / query parameters ----
  "api.REQUEST_BODY_INVALID": "Request body must be an object.",
  "api.FIELD_TYPE_INVALID": "One or more fields must be text.",
  "api.PAGE_INVALID": "Page must be a positive integer.",
  "api.LIMIT_INVALID": "Limit must be an integer between 1 and 50.",
  "api.SEARCH_INVALID": "Search must be text.",
  "api.SEARCH_TOO_LONG": "Search is too long. Please shorten it.",
  "api.CATEGORY_FILTER_INVALID": "Category filter must be text.",
  "api.ROLE_FILTER_INVALID": "Role filter is not valid.",
  "api.STATUS_FILTER_INVALID": "Status filter is not valid.",
  "api.USER_STATUS_INVALID": "Account status must be true or false.",
  "api.ADMIN_SELF_DISABLE": "You cannot disable your own admin account.",
  "api.ADMIN_ACCOUNT_PROTECTED": "Admin accounts cannot be disabled.",
  "api.DECISION_INVALID": "That decision is not valid.",

  // ---- Cultural content ----
  "api.CONTENT_TITLE_REQUIRED": "Title is required.",
  "api.CONTENT_BODY_REQUIRED": "Content is required.",
  "api.CONTENT_CATEGORY_REQUIRED": "Category is required.",
  "api.CONTENT_CATEGORY_UNKNOWN": "Unknown category. Choose one of the available categories.",
  "api.CONTENT_CATEGORY_INACTIVE": "This category is deactivated and cannot be used.",
  "api.CONTENT_UPDATE_EMPTY": "Nothing to update. Provide title, content or category.",
  "api.CONTENT_ID_REQUIRED": "Content ID is required.",
  "api.CONTENT_MISMATCH": "Content does not match the collaboration request.",

  // ---- Collaboration ----
  "api.COLLABORATION_MESSAGE_REQUIRED": "Message is required.",
  "api.COLLABORATION_MESSAGE_TOO_LONG": "Message must be at most 500 characters.",
  "api.COLLABORATION_SELF_REQUEST": "You cannot send a collaboration request to yourself.",
  "api.ELDER_ACCOUNT_DISABLED":
    "This elder's account has been disabled, so new collaboration requests cannot be sent.",
  "api.COLLABORATION_NOT_ACCEPTED": "This collaboration has not been accepted yet.",
  "api.COLLABORATION_ALREADY_DECIDED": "This request has already been answered.",
  "api.COLLABORATION_REQUEST_ID_REQUIRED": "Collaboration request ID is required.",

  // ---- Contributions ----
  "api.CONTRIBUTION_TEXT_REQUIRED": "Contribution text is required.",
  "api.CONTRIBUTION_TYPE_REQUIRED": "Contribution type is required.",
  "api.CONTRIBUTION_TYPE_INVALID": "Contribution type is not valid.",
  "api.CONTRIBUTION_FEEDBACK_REQUIRED": "Feedback is required when requesting changes.",
  "api.CONTRIBUTION_LOCKED": "Approved contributions can no longer be edited.",
  "api.CONTRIBUTION_TRANSITION_INVALID": "That change is not allowed at this stage.",

  // ---- Categories ----
  "api.CATEGORY_KEY_REQUIRED": "Category key is required.",
  "api.CATEGORY_KEY_TOO_LONG": "Category key must be at most 60 characters.",
  "api.CATEGORY_KEY_INVALID": "Category key may only contain letters, numbers, spaces and hyphens.",
  "api.CATEGORY_KEY_DOUBLE_SPACE": "Category key cannot contain double spaces.",
  "api.CATEGORY_LABEL_REQUIRED": "Category label is required.",
  "api.CATEGORY_LABEL_TOO_LONG": "Category label must be at most 60 characters.",
  "api.CATEGORY_DUPLICATE": "This category key already exists.",
  "api.CATEGORY_STATUS_INVALID": "Active must be true or false.",
  "api.CATEGORY_IN_USE":
    "This category is used by cultural content. Deactivate it instead.",
  "api.CATEGORY_DEFAULT":
    "This is a built-in default category. It cannot be deleted, only deactivated.",

  // ---- Uploads ----
  "api.IMAGE_TOO_LARGE": "Image is too large. Maximum size is 5 MB.",
  "api.IMAGE_INVALID": "The image could not be read. Please choose another file.",
  "api.IMAGE_MISSING": "No image was received. Send the file in the image field.",
  "api.AUDIO_TOO_LARGE": "The recording is too large. Maximum size is 10 MB.",
  "api.AUDIO_INVALID": "The recording could not be read. Please record it again.",
  "api.AUDIO_MISSING": "No recording was received. Send the file in the audio field.",
} as const;

export type ApiKey = keyof typeof enApi;

export const siApi: Record<ApiKey, string> = {
  // ---- Generic ----
  "api.SERVER_ERROR": "යම් දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.",
  "api.NOT_FOUND": "එම දෙය හමු නොවීය.",
  "api.FORBIDDEN": "එය කිරීමට ඔබට අවසරයක් නැත.",
  "api.DUPLICATE": "මෙම අන්තර්ගතය සඳහා ඔබට දැනටමත් රැඳී හෝ පිළිගත් ඉල්ලීමක් ඇත.",
  "api.RATE_LIMITED": "උත්සාහ බොහෝ විටයි. මිනිත්තු කිහිපයක් රැඳී සිට නැවත උත්සාහ කරන්න.",

  // ---- Authentication / session ----
  "api.AUTH_REQUIRED": "ඉදිරියට යාමට කරුණාකර පිවිසෙන්න.",
  "api.AUTH_MISSING_TOKEN": "ඔබගේ සැසිය නොමැත. නැවත පිවිසෙන්න.",
  "api.AUTH_INVALID_TOKEN": "ඔබගේ සැසිය වලංගු නැත. නැවත පිවිසෙන්න.",
  "api.AUTH_TOKEN_EXPIRED": "ඔබගේ සැසි කාලය ඉකුත් වී ඇත. නැවත පිවිසෙන්න.",
  "api.AUTH_TOKEN_REVOKED": "ඔබගේ සැසිය අවසන් කර ඇත. නැවත පිවිසෙන්න.",
  "api.AUTH_INVALID_CREDENTIALS": "විද්‍යුත් තැපෑල හෝ මුර පදය වැරදිය.",
  "api.AUTH_EMAIL_EXISTS": "මෙම විද්‍යුත් තැපෑලෙන් ගිණුමක් දැනටමත් පවතී.",
  "api.ACCOUNT_DISABLED":
    "මෙම ගිණුම අක්‍රිය කර ඇත. කරුණාකර පරිපාලකයෙකු අමත වන්න.",

  // ---- Passwords ----
  "api.PASSWORD_REQUIRED": "මුර පදය අවශ්‍යයි.",
  "api.PASSWORD_CURRENT_INCORRECT": "ඔබගේ වත්මන් මුර පදය වැරදිය.",
  "api.PASSWORD_POLICY": "මුර පදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.",
  "api.PASSWORD_UNCHANGED": "නව මුර පදය වත්මන් මුර පදයට වෙනස් විය යුතුය.",
  "api.PASSWORD_WEAK": "මුර පදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.",

  // ---- Field validation ----
  "api.EMAIL_REQUIRED": "විද්‍යුත් තැපෑල අවශ්‍යයි.",
  "api.EMAIL_INVALID": "වලංගු විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න.",
  "api.NAME_REQUIRED": "නම අවශ්‍යයි.",
  "api.NAME_TOO_SHORT": "නම අවම වශයෙන් අකුරු 2ක් විය යුතුය.",
  "api.ROLE_REQUIRED": "කරුණාකර භූමිකාවක් තෝරන්න.",
  "api.ROLE_INVALID": "භූමිකාව වැඩිහිටියෙකු හෝ තරුණයෙකු විය යුතුය.",

  // ---- Request / query parameters ----
  "api.REQUEST_BODY_INVALID": "ඉල්ලීමේ දත්ත වස්තුවක් විය යුතුය.",
  "api.FIELD_TYPE_INVALID": "ක්ෂේත්‍ර එකක් හෝ වැඩි ගණනක් පෙළ විය යුතුය.",
  "api.PAGE_INVALID": "පිටුව ධන පූර්ණ සංඛ්‍යාවක් විය යුතුය.",
  "api.LIMIT_INVALID": "සීමාව 1 සහ 50 අතර සංඛ්‍යාවක් විය යුතුය.",
  "api.SEARCH_INVALID": "සෙවුම පෙළ විය යුතුය.",
  "api.SEARCH_TOO_LONG": "සෙවුම ඉතා දිගයි. කරුණාකර කෙටි කරන්න.",
  "api.CATEGORY_FILTER_INVALID": "පරිච්ඡේද පෙරහන පෙළ විය යුතුය.",
  "api.ROLE_FILTER_INVALID": "භූමිකා පෙරහන වලංගු නැත.",
  "api.STATUS_FILTER_INVALID": "තත්ත්ව පෙරහන වලංගු නැත.",
  "api.USER_STATUS_INVALID": "ගිණුමේ තත්ත්වය true හෝ false විය යුතුය.",
  "api.ADMIN_SELF_DISABLE": "ඔබගේම පරිපාලක ගිණුම අක්‍රිය කළ නොහැක.",
  "api.ADMIN_ACCOUNT_PROTECTED": "පරිපාලක ගිණුම් අක්‍රිය කළ නොහැක.",
  "api.DECISION_INVALID": "එම තීරණය වලංගු නැත.",
  // ---- Cultural content ----
  "api.CONTENT_TITLE_REQUIRED": "මාතෘකාව අවශ්‍යයි.",
  "api.CONTENT_BODY_REQUIRED": "අන්තර්ගතය අවශ්‍යයි.",
  "api.CONTENT_CATEGORY_REQUIRED": "පරිච්ඡේදය අවශ්‍යයි.",
  "api.CONTENT_CATEGORY_UNKNOWN": "නොදන්නා පරිච්ඡේදයකි. ඇති පරිච්ඡේද අතරින් එකක් තෝරන්න.",
  "api.CONTENT_CATEGORY_INACTIVE": "මෙම පරිච්ඡේදය අක්‍රිය කර ඇති බැවින් භාවිතා කළ නොහැක.",
  "api.CONTENT_UPDATE_EMPTY": "යාවත්කාලීන කිරීමට දෙයක් නැත. මාතෘකාව, අන්තර්ගතය හෝ පරිච්ඡේදය ඇතුළත් කරන්න.",
  "api.CONTENT_ID_REQUIRED": "අන්තර්ගත හඳුනාගැනීම අවශ්‍යයි.",
  "api.CONTENT_MISMATCH": "අන්තර්ගතය සහයෝගිතා ඉල්ලීමට නොගැලපේ.",

  // ---- Collaboration ----
  "api.COLLABORATION_MESSAGE_REQUIRED": "පණිවිඩය අවශ්‍යයි.",
  "api.COLLABORATION_MESSAGE_TOO_LONG": "පණිවිඩය උපරිම අකුරු 500ක් විය යුතුය.",
  "api.COLLABORATION_SELF_REQUEST": "ඔබට ඔබටම සහයෝගිතා ඉල්ලීමක් යැවිය නොහැක.",
  "api.ELDER_ACCOUNT_DISABLED":
    "මෙම වැඩිහිටිගේ ගිණුම අක්‍රිය කර ඇති නිසා නව සහයෝගිතා ඉල්ලීම් යැවිය නොහැක.",
  "api.COLLABORATION_NOT_ACCEPTED": "මෙම සහයෝගිතාව තවම පිළිගෙන නැත.",
  "api.COLLABORATION_ALREADY_DECIDED": "මෙම ඉල්ලීමට දැනටමත් පිළිතුරු දී ඇත.",
  "api.COLLABORATION_REQUEST_ID_REQUIRED": "සහයෝගිතා ඉල්ලීමේ හඳුනාගැනීම අවශ්‍යයි.",

  // ---- Contributions ----
  "api.CONTRIBUTION_TEXT_REQUIRED": "දායකත්ව පෙළ අවශ්‍යයි.",
  "api.CONTRIBUTION_TYPE_REQUIRED": "දායකත්ව වර්ගය අවශ්‍යයි.",
  "api.CONTRIBUTION_TYPE_INVALID": "දායකත්ව වර්ගය වලංගු නැත.",
  "api.CONTRIBUTION_FEEDBACK_REQUIRED": "වෙනස්කම් ඉල්ලීමේදී ප්‍රතිපෝෂණය අවශ්‍යයි.",
  "api.CONTRIBUTION_LOCKED": "අනුමත දායකත්ව තවදුරටත් සංස්කරණය කළ නොහැක.",
  "api.CONTRIBUTION_TRANSITION_INVALID": "මෙම අවස්ථාවේදී එවැනි වෙනස්කමක් අවසර නැත.",

  // ---- Categories ----
  "api.CATEGORY_KEY_REQUIRED": "පරිච්ඡේද යතුර අවශ්‍යයි.",
  "api.CATEGORY_KEY_TOO_LONG": "පරිච්ඡේද යතුර උපරිම අකුරු 60ක් විය යුතුය.",
  "api.CATEGORY_KEY_INVALID": "පරිච්ඡේද යතුරේ අකුරු, සංඛ්‍යා, හිස් තැන් සහ ඉරි පමණක් තිබිය හැක.",
  "api.CATEGORY_KEY_DOUBLE_SPACE": "පරිච්ඡේද යතුරේ අඛණ්ඩ හිස් තැන් තිබිය නොහැක.",
  "api.CATEGORY_LABEL_REQUIRED": "පරිච්ඡේද නාමය අවශ්‍යයි.",
  "api.CATEGORY_LABEL_TOO_LONG": "පරිච්ඡේද නාමය උපරිම අකුරු 60ක් විය යුතුය.",
  "api.CATEGORY_DUPLICATE": "මෙම පරිච්ඡේද යතුර දැනටමත් පවතී.",
  "api.CATEGORY_STATUS_INVALID": "සක්‍රීය අගය true හෝ false විය යුතුය.",
  "api.CATEGORY_IN_USE":
    "මෙම පරිච්ඡේදය සංස්කෘතික අන්තර්ගතය භාවිතා කරයි. එය අක්‍රිය කරන්න.",
  "api.CATEGORY_DEFAULT":
    "මෙය ගොඩනැමි පෙරනිමි පරිච්ඡේදයකි. එය මකා දැමිය නොහැක, අක්‍රිය කිරීමට පමණක් හැකිය.",

  // ---- Uploads ----
  "api.IMAGE_TOO_LARGE": "රූපය ඉතා විශාලයි. උපරිම ප්‍රමාණය MB 5යි.",
  "api.IMAGE_INVALID": "රූපය කියවීමට නොහැකි විය. කරුණාකර වෙනත් ගොනුවක් තෝරන්න.",
  "api.IMAGE_MISSING": "රූපයක් ලැබුණේ නැත. රූප ක්ෂේත්‍රයෙන් ගොනුව යවන්න.",
  "api.AUDIO_TOO_LARGE": "පටිගත කිරීම ඉතා විශාලයි. උපරිම ප්‍රමාණය MB 10යි.",
  "api.AUDIO_INVALID": "පටිගත කිරීම කියවීමට නොහැකි විය. කරුණාකර නැවත පටිගත කරන්න.",
  "api.AUDIO_MISSING": "පටිගත කිරීමක් ලැබුණේ නැත. ශබ්ද ක්ෂේත්‍රයෙන් ගොනුව යවන්න.",
};
