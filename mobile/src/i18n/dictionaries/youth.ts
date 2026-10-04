/**
 * Youth route strings: knowledge-holder discovery (find-holders),
 * collaboration request flow, outgoing workspace and add-contribution.
 *
 * Shared screens (browse, content detail, elder profile, saved, collaborate,
 * settings, change password) are keyed by their own domain dictionaries; this
 * file only owns the youth-prefixed keys used by mobile/app/youth routes.
 */

export const enYouth = {
  // find-holders (knowledge holder discovery)
  "youth.loadHoldersError": "Failed to load knowledge holders",
  "youth.contributionCountOne": "{count} Contribution",
  "youth.contributionCountMany": "{count} Contributions",
  "youth.viewProfile": "View Profile",
  "youth.viewProfileA11y": "View {name}'s profile",
  "youth.a11ySearchHolders": "Search knowledge holders by name or bio",
  "youth.a11yClearSearch": "Clear search",
  "youth.a11yFilterLanguage": "Filter by language",
  "youth.a11yFilterLanguageCurrent": "Filter by language, currently {language}",
  "youth.filterAll": "All",
  "youth.a11yAllInterests": "All interests",
  "youth.noHoldersFiltered": "No knowledge holders match your filters.",
  "youth.noHoldersFound": "No knowledge holders found yet.",
  "youth.clearFilters": "Clear filters",
  "youth.a11yCloseLanguageFilter": "Close language filter",
  "youth.allLanguages": "All languages",

  // collaboration request
  "youth.messageRequired":
    "Please write a short message explaining how you can help",
  "youth.messageTooLong": "Message must be at most {max} characters",
  "youth.sendRequestFailed": "Failed to send request",
  "youth.requestSent": "Request Sent",
  "youth.requestSentTitle": "Request Sent!",
  "youth.requestSentBody":
    "Your collaboration request for \"{contentTitle}\" has been sent to {elderName}. You will be notified when they respond.",
  "youth.viewOutgoingRequests": "View Outgoing Requests",
  "youth.backToHome": "Back to Home",
  "youth.requestCollaboration": "Request Collaboration",
  "youth.collaborateWithName": "Collaborate with {name}",
  "youth.requestingCollabOn": "You are requesting to collaborate on:",
  "youth.explainContribute":
    "Explain how you would like to contribute. This could be a translation, transcription, explanation, or cultural context.",
  "youth.yourMessage": "Your Message",
  "youth.messagePlaceholder":
    "I would like to help translate this story into English...",
  "youth.charCount": "{count}/{max} characters",
  "youth.sending": "Sending...",
  "youth.sendRequest": "Send Request",

  // add-contribution - contribution types
  "youth.typeLabel.translation": "Translation",
  "youth.typeLabel.explanation": "Explanation",
  "youth.typeLabel.transcription": "Transcription",
  "youth.typeLabel.context": "Context",
  "youth.typeDesc.translation": "Translate the content into another language",
  "youth.typeDesc.explanation":
    "Explain the meaning or interpretation of content",
  "youth.typeDesc.transcription": "Convert spoken language into written form",
  "youth.typeDesc.context":
    "Add cultural or historical background information",

  // add-contribution / collaboration-workspace shared states
  "youth.noCollaboration": "No collaboration specified",
  "youth.workspaceLoadFailed": "Failed to load workspace",
  "youth.contributionNotFound": "Contribution not found",
  "youth.selectType": "Please select a contribution type",
  "youth.enterContributionText": "Please enter your contribution text",
  "youth.workspaceNotLoaded": "Workspace data not loaded. Please try again.",
  "youth.submitContributionFailed": "Failed to submit contribution",

  // add-contribution - headers, success and form
  "youth.contributionUpdated": "Contribution Updated",
  "youth.contributionSubmittedHeader": "Contribution Submitted",
  "youth.changesSubmitted": "Changes Submitted!",
  "youth.contributionSubmittedTitle": "Contribution Submitted!",
  "youth.revisedSubmittedBody":
    "Your revised contribution has been sent for review.",
  "youth.contributionSentBody":
    "Your contribution has been sent to the Elder for review.",
  "youth.backToWorkspace": "Back to Workspace",
  "youth.reviseContribution": "Revise Contribution",
  "youth.addContribution": "Add Contribution",
  "youth.contributionType": "Contribution Type",
  "youth.typeLocked": "Type cannot be changed after submission.",
  "youth.selectTypePrompt":
    "Select what kind of contribution you are making:",
  "youth.contributionText": "Contribution Text",
  "youth.placeholderTranslation": "Enter your translation...",
  "youth.placeholderExplanation": "Enter your explanation...",
  "youth.placeholderTranscription": "Enter your transcription...",
  "youth.placeholderContext": "Enter context information...",
  "youth.placeholderDefault": "Enter your contribution...",
  "youth.languageOptional": "Language (optional)",
  "youth.languagePlaceholder": "e.g., Sinhala, English, Tamil",
  "youth.submitting": "Submitting...",
  "youth.submitRevision": "Submit Revision",
  "youth.submitContribution": "Submit Contribution",

  // collaboration workspace
  "youth.collaboration": "Collaboration",
  "youth.loadingWorkspace": "Loading workspace...",
  "youth.backToRequests": "Back to Requests",
  "youth.workspaceUnavailable": "Workspace not available.",
  "youth.a11yTabHome": "Home tab",
  "youth.a11yTabExplore": "Explore tab",
  "youth.a11yTabCollaborate": "Collaborate tab",
  "youth.a11yTabSaved": "Saved tab",
  "youth.a11yTabProfile": "Profile tab",
} as const;

export type YouthKey = keyof typeof enYouth;

export const siYouth: Record<YouthKey, string> = {
  // find-holders (knowledge holder discovery)
  "youth.loadHoldersError": "දැනුම් හිමියන් පූරණය කිරීම අසාර්ථකයි",
  "youth.contributionCountOne": "{count} දායකත්වයක්",
  "youth.contributionCountMany": "{count} දායකත්වයන්",
  "youth.viewProfile": "ප්‍රොෆයිල් බලන්න",
  "youth.viewProfileA11y": "{name} ගේ ප්‍රොෆයිල් බලන්න",
  "youth.a11ySearchHolders": "නම හෝ හැඳින්වීම අනුව දැනුම් හිමියන් සොයන්න",
  "youth.a11yClearSearch": "සොයීම හිස් කරන්න",
  "youth.a11yFilterLanguage": "භාෂාව අනුව පෙරහන් කරන්න",
  "youth.a11yFilterLanguageCurrent":
    "භාෂාව අනුව පෙරහන් කරන්න; දැන් {language}",
  "youth.filterAll": "සියල්ල",
  "youth.a11yAllInterests": "සියලුම අභිලාෂ",
  "youth.noHoldersFiltered": "ඔබේ පෙරහන්වලට ගැලපෙන දැනුම් හිමියන් නැත.",
  "youth.noHoldersFound": "තවම හමු වූ දැනුම් හිමියන් නැත.",
  "youth.clearFilters": "පෙරහන් ඉවත් කරන්න",
  "youth.a11yCloseLanguageFilter": "භාෂා පෙරහන වසන්න",
  "youth.allLanguages": "සියලුම භාෂා",

  // collaboration request
  "youth.messageRequired":
    "ඔබට උදව් කළ හැකි ආකාරය කෙටියෙන් පැහැදිලි කරමින් කෙටි පණිවිඩයක් ලියන්න",
  "youth.messageTooLong": "පණිවිඩය අක්ෂර {max}කට වැඩි නොවිය යුතුය",
  "youth.sendRequestFailed": "ඉල්ලීම යැවීම අසාර්ථකයි",
  "youth.requestSent": "ඉල්ලීම යවන ලදී",
  "youth.requestSentTitle": "ඉල්ලීම යවන ලදී!",
  "youth.requestSentBody":
    "ඔබේ \"{contentTitle}\" සඳහා සහයෝගිතා ඉල්ලීම {elderName} වෙත යවා ඇත. ඔවුන් පිළිතුරු දුන් විට ඔබට දැනුම්දෙනු ලැබේ.",
  "youth.viewOutgoingRequests": "යවන ලද ඉල්ලීම් බලන්න",
  "youth.backToHome": "මුල් පිටුවට ආපසු",
  "youth.requestCollaboration": "සහයෝගිතාවක් ඉල්ලන්න",
  "youth.collaborateWithName": "{name} සමඟ සහයෝගී වන්න",
  "youth.requestingCollabOn": "ඔබ පහත දේ සඳහා සහයෝගී වීම ඉල්ලා සිටියි:",
  "youth.explainContribute":
    "ඔබ සහභාගී වීමට අපේක්ෂා කරන ආකාරය පැහැදිලි කරන්න. එය පරිවර්තනයක්, පිටපත් කිරීමක්, පැහැදිලි කිරීමක් හෝ සංස්කෘතික සන්දර්භයක් විය හැක.",
  "youth.yourMessage": "ඔබේ පණිවිඩය",
  "youth.messagePlaceholder":
    "මම මෙම කතාව ඉංග්‍රීසි භාෂාවට පරිවර්තනය කිරීමට උදව් කිරීමට කැමතියි...",
  "youth.charCount": "අක්ෂර {count}/{max}",
  "youth.sending": "යවමින්...",
  "youth.sendRequest": "ඉල්ලීම යවන්න",

  // add-contribution - contribution types
  "youth.typeLabel.translation": "පරිවර්තනය",
  "youth.typeLabel.explanation": "පැහැදිලි කිරීම",
  "youth.typeLabel.transcription": "පිටපත් කිරීම",
  "youth.typeLabel.context": "සන්දර්භය",
  "youth.typeDesc.translation": "අන්තර්ගතය තවත් භාෂාවකට පරිවර්තනය කරන්න",
  "youth.typeDesc.explanation":
    "අන්තර්ගතයේ අර්ථය හෝ අර්ථකථනය පැහැදිලි කරන්න",
  "youth.typeDesc.transcription":
    "කථන භාෂාව ලිඛිත පෙළ බවට පරිවර්තනය කරන්න",
  "youth.typeDesc.context":
    "සංස්කෘතික හෝ ඉතිහාස පසුබිම් තොරතුරු එකතු කරන්න",

  // add-contribution / collaboration-workspace shared states
  "youth.noCollaboration": "සහයෝගිතාවක් සඳහනා කර නැත",
  "youth.workspaceLoadFailed": "වැඩබිම පූරණය කිරීම අසාර්ථකයි",
  "youth.contributionNotFound": "දායකත්වය හමු නොවීය",
  "youth.selectType": "දායකත්ව වර්ගයක් තෝරන්න",
  "youth.enterContributionText": "ඔබේ දායකත්ව පෙළ ඇතුළත් කරන්න",
  "youth.workspaceNotLoaded":
    "වැඩබිම් දත්ත පූරණය වී නැත. නැවත උත්සාහ කරන්න.",
  "youth.submitContributionFailed": "දායකත්වය ඉදිරිපත් කිරීම අසාර්ථකයි",

  // add-contribution - headers, success and form
  "youth.contributionUpdated": "දායකත්වය යාවත්කාලීන කරන ලදී",
  "youth.contributionSubmittedHeader": "දායකත්වය ඉදිරිපත් කරන ලදී",
  "youth.changesSubmitted": "වෙනස්කම් ඉදිරිපත් කරන ලදී!",
  "youth.contributionSubmittedTitle": "දායකත්වය ඉදිරිපත් කරන ලදී!",
  "youth.revisedSubmittedBody":
    "ඔබේ සංශෝධිත දායකත්වය සමාලෝචනය සඳහා යවා ඇත.",
  "youth.contributionSentBody":
    "ඔබේ දායකත්වය සමාලෝචනය සඳහා වැඩිහිටියා වෙත යවා ඇත.",
  "youth.backToWorkspace": "වැඩබිමට ආපසු",
  "youth.reviseContribution": "දායකත්වය සංශෝධනය කරන්න",
  "youth.addContribution": "දායකත්වයක් එකතු කරන්න",
  "youth.contributionType": "දායකත්ව වර්ගය",
  "youth.typeLocked": "ඉදිරිපත් කිරීමෙන් පසු වර්ගය වෙනස් කළ නොහැක.",
  "youth.selectTypePrompt":
    "ඔබ සිදු කරන්නේ කුමන වර්ගයේ දායකත්වයක්ද යන්න තෝරන්න:",
  "youth.contributionText": "දායකත්ව පෙළ",
  "youth.placeholderTranslation": "ඔබේ පරිවර්තනය ඇතුළත් කරන්න...",
  "youth.placeholderExplanation": "ඔබේ පැහැදිලි කිරීම ඇතුළත් කරන්න...",
  "youth.placeholderTranscription": "ඔබේ පිටපත් කිරීම ඇතුළත් කරන්න...",
  "youth.placeholderContext": "සන්දර්භ තොරතුරු ඇතුළත් කරන්න...",
  "youth.placeholderDefault": "ඔබේ දායකත්වය ඇතුළත් කරන්න...",
  "youth.languageOptional": "භාෂාව (අවශ්‍ය නැත)",
  "youth.languagePlaceholder": "උදා: සිංහල, ඉංග්‍රීසි, දෙමළ",
  "youth.submitting": "ඉදිරිපත් කරමින්...",
  "youth.submitRevision": "සංශෝධනය ඉදිරිපත් කරන්න",
  "youth.submitContribution": "දායකත්වය ඉදිරිපත් කරන්න",

  // collaboration workspace
  "youth.collaboration": "සහයෝගිතාව",
  "youth.loadingWorkspace": "වැඩබිම පූරණය වෙමින්...",
  "youth.backToRequests": "ඉල්ලීම්වලට ආපසු",
  "youth.workspaceUnavailable": "වැඩබිම නොමැත.",
  "youth.a11yTabHome": "මුල් පිටු ටැබ් එක",
  "youth.a11yTabExplore": "සොයා බැලීමේ ටැබ් එක",
  "youth.a11yTabCollaborate": "සහයෝග ටැබ් එක",
  "youth.a11yTabSaved": "සුරකින ලද ටැබ් එක",
  "youth.a11yTabProfile": "ප්‍රොෆයිල් ටැබ් එක",
};
