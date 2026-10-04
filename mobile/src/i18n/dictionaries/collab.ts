/**
 * Collaboration domain: outgoing/incoming requests, the accepted workspace
 * and contribution review.
 *
 * Reuses shared keys instead of duplicating them: `common.*` (Retry),
 * `nav.collaborate`, `home.collaborationRequests`, `profile.roleElder` /
 * `profile.roleYouth` (role labels + name fallbacks), `profile.culturalBackground`
 * and the `contribType.*` labels owned by notifications.ts (contribution type
 * badges resolve through translateBuiltin so the stored English type value is
 * never rewritten).
 */

export const enCollab = {
  // Shared request lists (Collaborate + Incoming requests)
  "collab.myRequests": "My Requests",
  "collab.loadingRequests": "Loading requests...",
  "collab.loadRequestsFailed": "Failed to load requests",
  "collab.decisionFailed": "Failed to process decision",
  "collab.culturalItem": "Cultural Item",
  "collab.emptyOutgoing":
    "You haven't sent any collaboration requests yet. Find a knowledge holder and send one from their profile.",
  "collab.emptyIncoming":
    "No collaboration requests yet. When a youth asks to collaborate on your content, it will show up here.",
  "collab.acceptedWorkspaces": "Accepted Workspaces",
  "collab.openWorkspace": "Open Workspace",
  "collab.openWorkspaceA11y": "Open the collaboration workspace with {name}",
  "collab.noAccepted": "No accepted workspaces yet.",
  "collab.noPending": "No pending requests yet.",
  "collab.accept": "Accept",
  "collab.reject": "Reject",
  "collab.processing": "Processing...",

  // CollaborationRequest.status: pending | accepted | rejected
  "collab.reqStatus.pending": "Pending",
  "collab.reqStatus.accepted": "Accepted",
  "collab.reqStatus.rejected": "Rejected",

  // Workspace
  "collab.collabAccepted": "Collaboration Accepted",
  "collab.originalItem": "Original Cultural Item",
  "collab.tags": "Tags",
  "collab.collabMessage": "Collaboration Message",
  "collab.youthContributions": "Youth Contributions",
  "collab.yourContributions": "Your Contributions",
  "collab.add": "+ Add",
  "collab.emptyContributionsElder": "No contributions submitted yet.",
  "collab.emptyContributionsYouth":
    "No contributions yet. Start by adding a translation, explanation, transcription, or context.",
  "collab.reviewQueue": "Review Queue",
  "collab.nothingToReview": "Nothing awaiting review.",

  // ContributionData.status: pending_review | changes_requested | approved
  "collab.status.pending_review": "Pending Review",
  "collab.status.changes_requested": "Changes Requested",
  "collab.status.approved": "Approved",

  // Contribution type descriptions (labels live in contribType.*)
  "collab.typeDesc.translation": "Translating content into another language",
  "collab.typeDesc.explanation": "Providing meaning or interpretation of content",
  "collab.typeDesc.transcription": "Converting spoken language into written form",
  "collab.typeDesc.context": "Adding cultural or historical background information",

  // Contribution card
  "collab.submittedBy": "Submitted by {name}",
  "collab.language": "Language: {language}",
  "collab.elderFeedback": "Elder Feedback",
  "collab.feedbackLabel": "Feedback for Youth (required for changes)",
  "collab.feedbackPlaceholder": "Explain what changes are needed...",
  "collab.feedbackRequired": "Feedback is required when requesting changes",
  "collab.approve": "Approve",
  "collab.requestChanges": "Request Changes",
  "collab.reviseResubmit": "Revise & Resubmit",
} as const;

export type CollabKey = keyof typeof enCollab;

export const siCollab: Record<CollabKey, string> = {
  // Shared request lists
  "collab.myRequests": "මගේ ඉල්ලීම්",
  "collab.loadingRequests": "ඉල්ලීම් පූරණය වෙමින්...",
  "collab.loadRequestsFailed": "ඉල්ලීම් පූරණය කිරීම අසාර්ථකයි",
  "collab.decisionFailed": "තීරණය ක්‍රියාත්මක කිරීම අසාර්ථකයි",
  "collab.culturalItem": "සංස්කෘතික අයිතමය",
  "collab.emptyOutgoing":
    "ඔබ තවම සහයෝගිතා ඉල්ලීම් යවා නැත. දැනුම් හිමියෙකු සොයාගෙන ඔවුන්ගේ ප්‍රොෆයිල් එකෙන් ඉල්ලීමක් යවන්න.",
  "collab.emptyIncoming":
    "තවම සහයෝගිතා ඉල්ලීම් නැත. තරුණයෙකු ඔබේ අන්තර්ගතය සමඟ සහයෝගයෙන් කටයුතු කිරීමට ඉල්ලුවොත්, එය මෙහි දිස්වනු ඇත.",
  "collab.acceptedWorkspaces": "පිළිගත් වැඩ අවකාශ",
  "collab.openWorkspace": "වැඩ අවකාශය විවෘත කරන්න",
  "collab.openWorkspaceA11y": "{name} සමඟ සහයෝගිතා වැඩ අවකාශය විවෘත කරන්න",
  "collab.noAccepted": "තවම පිළිගත් වැඩ අවකාශ නැත.",
  "collab.noPending": "තවම බලා සිටි ඉල්ලීම් නැත.",
  "collab.accept": "පිළිගන්න",
  "collab.reject": "ප්‍රතික්ෂේප කරන්න",
  "collab.processing": "සකසමින්...",

  // CollaborationRequest.status
  "collab.reqStatus.pending": "බලා සිටී",
  "collab.reqStatus.accepted": "පිළිගන්නා ලදී",
  "collab.reqStatus.rejected": "ප්‍රතික්ෂේප කරන ලදී",

  // Workspace
  "collab.collabAccepted": "සහයෝගිතාව පිළිගන්නා ලදී",
  "collab.originalItem": "මුල් සංස්කෘතික අයිතමය",
  "collab.tags": "ටැග්",
  "collab.collabMessage": "සහයෝගිතා පණිවිඩය",
  "collab.youthContributions": "තරුණ දායකත්වයන්",
  "collab.yourContributions": "ඔබේ දායකත්වයන්",
  "collab.add": "+ එකතු කරන්න",
  "collab.emptyContributionsElder": "තවම දායකත්වයන් ඉදිරිපත් කර නැත.",
  "collab.emptyContributionsYouth":
    "තවම දායකත්වයන් නැත. පරිවර්තනයක්, පැහැදිලි කිරීමක්, පිටපත් කිරීමක් හෝ සන්දර්භයක් එකතු කිරීමෙන් ආරම්භ කරන්න.",
  "collab.reviewQueue": "සමාලෝචන පෝලිම",
  "collab.nothingToReview": "සමාලෝචනය සඳහා කිසිවක් නැත.",

  // ContributionData.status
  "collab.status.pending_review": "සමාලෝචනයට බලා සිටී",
  "collab.status.changes_requested": "වෙනස්කම් ඉල්ලා ඇත",
  "collab.status.approved": "අනුමතයි",

  // Contribution type descriptions
  "collab.typeDesc.translation": "අන්තර්ගතය තවත් භාෂාවකට පරිවර්තනය කිරීම",
  "collab.typeDesc.explanation": "අන්තර්ගතයේ අර්ථය හෝ අර්ථකථනය ලබා දීම",
  "collab.typeDesc.transcription": "කථන භාෂාව ලිඛිත ආකාරයට පරිවර්තනය කිරීම",
  "collab.typeDesc.context": "සංස්කෘතික හෝ ඓතිහාසික පසුබිම් තොරතුරු එකතු කිරීම",

  // Contribution card
  "collab.submittedBy": "{name} විසින් ඉදිරිපත් කරන ලදී",
  "collab.language": "භාෂාව: {language}",
  "collab.elderFeedback": "වැඩිහිටි ප්‍රතිපෝෂණය",
  "collab.feedbackLabel": "තරුණයා සඳහා ප්‍රතිපෝෂණය (වෙනස්කම් සඳහා අවශ්‍යයි)",
  "collab.feedbackPlaceholder": "අවශ්‍ය වෙනස්කම් මොනවාදැයි පැහැදිලි කරන්න...",
  "collab.feedbackRequired": "වෙනස්කම් ඉල්ලීමේදී ප්‍රතිපෝෂණය අවශ්‍යයි",
  "collab.approve": "අනුමත කරන්න",
  "collab.requestChanges": "වෙනස්කම් ඉල්ලන්න",
  "collab.reviseResubmit": "සංශෝධනය කර නැවත ඉදිරිපත් කරන්න",
};
