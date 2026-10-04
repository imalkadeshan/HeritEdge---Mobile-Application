/**
 * Notifications: screen strings plus localized templates for system-generated
 * notification types.
 *
 * Backend stores a stable `type` + optional structured `params`. The mobile
 * app renders `notif.<type>` with those params when params exist; otherwise
 * (legacy records) it falls back to the stored English `message`. Content
 * titles inside params are user-authored and interpolated verbatim - the
 * dictionary only owns the surrounding sentence.
 */

export const enNotifications = {
  // Screen
  "notifications.title": "Notifications",
  "notifications.loading": "Loading notifications...",
  "notifications.markAll": "Mark All Read",
  "notifications.marking": "Marking...",
  "notifications.empty": "No notifications yet",
  "notifications.errorLoad": "Failed to load notifications",
  "notifications.unreadCount": "{count} unread",

  // Type templates (params: contentTitle?, contributionType?, revised?)
  "notif.collaboration_request_received":
    "A youth has sent you a collaboration request for \"{contentTitle}\"",
  "notif.collaboration_request_received_noTitle":
    "A youth has sent you a collaboration request",
  "notif.collaboration_accepted": "Your collaboration request has been accepted",
  "notif.collaboration_rejected":
    "Your collaboration request for \"{contentTitle}\" was declined",
  "notif.collaboration_rejected_noTitle": "Your collaboration request was declined",
  "notif.contribution_submitted":
    "A new {contributionType} has been submitted for your content \"{contentTitle}\"",
  "notif.contribution_submitted_noTitle":
    "A new {contributionType} has been submitted for your content",
  "notif.contribution_submitted_revised":
    "A revised {contributionType} has been submitted for \"{contentTitle}\"",
  "notif.contribution_submitted_revised_noTitle":
    "A revised {contributionType} has been submitted for \"your content\"",
  "notif.contribution_approved":
    "Your {contributionType} for \"{contentTitle}\" has been approved",
  "notif.contribution_approved_noTitle":
    "Your {contributionType} for \"a cultural item\" has been approved",
  "notif.contribution_changes_requested":
    "Your {contributionType} for \"{contentTitle}\" needs changes",
  "notif.contribution_changes_requested_noTitle":
    "Your {contributionType} for \"a cultural item\" needs changes",

  // Contribution types (stored values: translation|explanation|transcription|context)
  "contribType.translation": "translation",
  "contribType.explanation": "explanation",
  "contribType.transcription": "transcription",
  "contribType.context": "context",
} as const;

export type NotificationsKey = keyof typeof enNotifications;

export const siNotifications: Record<NotificationsKey, string> = {
  // Screen
  "notifications.title": "දැනුම්දීම්",
  "notifications.loading": "දැනුම්දීම් පූරණය වෙමින්...",
  "notifications.markAll": "සියල්ල කියවූ ලෙස සලකුණු කරන්න",
  "notifications.marking": "සලකුණු කරමින්...",
  "notifications.empty": "තවම දැනුම්දීම් නැත",
  "notifications.errorLoad": "දැනුම්දීම් පූරණය කිරීම අසාර්ථකයි",
  "notifications.unreadCount": "නොකියවූ {count}ක්",

  // Type templates
  "notif.collaboration_request_received":
    "තරුණයෙකු ඔබේ \"{contentTitle}\" සඳහා සහයෝගිතා ඉල්ලීමක් යවා ඇත",
  "notif.collaboration_request_received_noTitle":
    "තරුණයෙකු ඔබට සහයෝගිතා ඉල්ලීමක් යවා ඇත",
  "notif.collaboration_accepted": "ඔබේ සහයෝගිතා ඉල්ලීම පිළිගන්නා ලදී",
  "notif.collaboration_rejected":
    "ඔබේ \"{contentTitle}\" සඳහා සහයෝගිතා ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී",
  "notif.collaboration_rejected_noTitle": "ඔබේ සහයෝගිතා ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී",
  "notif.contribution_submitted":
    "ඔබේ \"{contentTitle}\" අන්තර්ගතය සඳහා නව {contributionType} එකක් ඉදිරිපත් කර ඇත",
  "notif.contribution_submitted_noTitle":
    "ඔබේ අන්තර්ගතය සඳහා නව {contributionType} එකක් ඉදිරිපත් කර ඇත",
  "notif.contribution_submitted_revised":
    "සංශෝධිත {contributionType} එකක් \"{contentTitle}\" සඳහා ඉදිරිපත් කර ඇත",
  "notif.contribution_submitted_revised_noTitle":
    "ඔබේ අන්තර්ගතය සඳහා සංශෝධිත {contributionType} එකක් ඉදිරිපත් කර ඇත",
  "notif.contribution_approved":
    "\"{contentTitle}\" සඳහා ඔබේ {contributionType} අනුමත කරන ලදී",
  "notif.contribution_approved_noTitle":
    "සංස්කෘතික අයිතමයක් සඳහා ඔබේ {contributionType} අනුමත කරන ලදී",
  "notif.contribution_changes_requested":
    "\"{contentTitle}\" සඳහා ඔබේ {contributionType} සඳහා වෙනස්කම් අවශ්‍යයි",
  "notif.contribution_changes_requested_noTitle":
    "සංස්කෘතික අයිතමයක් සඳහා ඔබේ {contributionType} සඳහා වෙනස්කම් අවශ්‍යයි",

  // Contribution types
  "contribType.translation": "පරිවර්තනය",
  "contribType.explanation": "පැහැදිලි කිරීම",
  "contribType.transcription": "පිටපත් කිරීම",
  "contribType.context": "සන්දර්භය",
};
