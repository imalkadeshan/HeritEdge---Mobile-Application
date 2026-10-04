/**
 * Auth + onboarding dictionary: splash, welcome, login, register, role
 * selection, profile setup and cultural interests, plus the validator/mock
 * messages surfaced by src/utils/mockAuth.ts.
 *
 * CONVENTION: the whole logged-out auth/onboarding area uses the single
 * `auth.` prefix - there is deliberately no separate `setup.` namespace, so
 * every string owned by these screens lives under `auth.`.
 *
 * Reused from other dictionaries instead of duplicated here:
 *   common.getStarted, common.back, common.errorTitle, common.connectionError,
 *   password.required / password.tooShort / password.mismatch,
 *   profile.nameRequired, profile.culturalInterests, settings.language*.
 * Built-in interest chips render through
 * `translateBuiltin(language, "interest", value)` while storing English.
 */

export const enAuth = {
  // Splash
  "auth.splashTagline": "Connecting generations, preserving\nculture.",

  // Welcome
  "auth.welcomeHeadline": "Learn. Share.\nPreserve.",
  "auth.welcomeDescription":
    "A safe space where elders can voice their legacy, and youth can secure knowledge that lasts generations.",
  "auth.haveAccount": "I already have an account",

  // Login
  "auth.loginTitle": "Welcome Back",
  "auth.loginSubtitle":
    "Sign in to continue learning and preserving language traditions.",
  "auth.emailLabel": "EMAIL ADDRESS",
  "auth.emailPlaceholder": "Enter your email",
  "auth.passwordLabel": "PASSWORD",
  "auth.passwordPlaceholder": "Enter your password",
  "auth.show": "SHOW",
  "auth.hide": "HIDE",
  "auth.forgotPassword": "Forgot Password?",
  "auth.login": "Log In",
  "auth.noAccount": "Don't have an account?",
  "auth.signUp": "Sign Up",
  "auth.loginFailed": "Login failed. Please try again.",
  "auth.accountDisabledSignedOut":
    "This account has been disabled by an administrator, so you were signed out. Your profile and cultural content are still saved.",

  // Register
  "auth.registerTitle": "Create Your Account",
  "auth.registerSubtitle": "Register to join community learning hubs.",
  "auth.fullNameLabel": "FULL NAME",
  "auth.fullNamePlaceholder": "Enter your name (e.g. Dadi Rukmani)",
  "auth.passwordMinPlaceholder": "Minimum 8 characters",
  "auth.confirmPasswordLabel": "CONFIRM PASSWORD",
  "auth.confirmPasswordPlaceholder": "Repeat your password",
  "auth.createAccount": "Create Account",
  "auth.alreadyHaveAccount": "Already have an account?",
  "auth.registerFailed": "Registration failed. Please try again.",

  // Validation (mockAuth validators return these keys; callers run t())
  "auth.fullNameRequired": "Full name is required",
  "auth.nameTooShort": "Name must be at least 2 characters",
  "auth.emailRequired": "Email is required",
  "auth.emailInvalid": "Please enter a valid email address",
  "auth.confirmPasswordRequired": "Please confirm your password",

  // Mock auth outcomes (mockLogin / mockRegister error keys)
  "auth.noAccountFound": "No account found with this email",
  "auth.incorrectPassword": "Incorrect password",
  "auth.emailAlreadyExists": "An account with this email already exists",

  // Role selection
  "auth.roleTitle": "How will you use\nHeritEdge?",
  "auth.roleSubtitle":
    "Select the role that fits you best. You can always change this later.",
  "auth.roleElderTitle": "I am an Elder",
  "auth.roleElderDesc":
    "Share your knowledge, stories, oral ballads, and folk traditions.",
  "auth.roleLearnerTitle": "I am a Learner",
  "auth.roleLearnerDesc":
    "Learn, discover, and help preserve local languages and cultural memories.",
  "auth.roleSaveFailed": "Could not save your role. Please try again.",
  "auth.continue": "Continue",
  "auth.continueWithCount": "Continue ({count} selected)",

  // Profile setup
  "auth.profileSetupTitle": "Profile Setup",
  "auth.displayNameLabel": "DISPLAY NAME",
  "auth.displayNamePlaceholder": "Enter your display name",
  "auth.langCommunityLabel": "PRIMARY LANGUAGE / COMMUNITY",
  "auth.langCommunityPlaceholder": "e.g. Maithili (Northern Bihar)",
  "auth.introLabel": "SHORT INTRODUCTION",
  "auth.introPlaceholder": "Tell us about yourself (optional)",
  "auth.knowledgeAreasLabel": "AREAS OF KNOWLEDGE",
  "auth.completeProfile": "Complete Profile",
  "auth.skipForNow": "Skip for now",

  // Cultural interests
  "auth.interestsTitle": "Interests",
  "auth.interestsSubtitle": "Select the topics that interest you most",
  "auth.selectOneInterest": "Please select at least one interest",
} as const;

export type AuthKey = keyof typeof enAuth;

export const siAuth: Record<AuthKey, string> = {
  // Splash
  "auth.splashTagline": "පරපුරෙන් පරපුරට සම්බන්ධ වෙමින්,\nසංස්කෘතිය රැක ගනිමින්",

  // Welcome
  "auth.welcomeHeadline": "ඉගෙන ගන්න. බෙදා දෙන්න.\nසුරකින්න.",
  "auth.welcomeDescription":
    "වැඩිහිටියන්ට තම උරුමය ප්‍රකාශ කරන, තරුණයන්ට පරපුරක් පුරා පවතින දැනුම ආරක්ෂා කර ගත හැකි ආරක්ෂිත තැනකි.",
  "auth.haveAccount": "මට දැනටමත් ගිණුමක් ඇත",

  // Login
  "auth.loginTitle": "නැවත සාදරයෙන් පිළිගනිමු",
  "auth.loginSubtitle": "භාෂා සම්ප්‍රදායන් ඉගෙන ගැනීමට හා රැක ගැනීමට පිවිසෙන්න.",
  "auth.emailLabel": "විද්‍යුත් තැපෑල",
  "auth.emailPlaceholder": "ඔබේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න",
  "auth.passwordLabel": "මුර පදය",
  "auth.passwordPlaceholder": "ඔබේ මුර පදය ඇතුළත් කරන්න",
  "auth.show": "පෙන්වන්න",
  "auth.hide": "සඟවන්න",
  "auth.forgotPassword": "මුර පදය අමතක වුණාද?",
  "auth.login": "පිවිසෙන්න",
  "auth.noAccount": "ගිණුමක් නැද්ද?",
  "auth.signUp": "ලියාපදිංචි වන්න",
  "auth.loginFailed": "පිවිසීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
  "auth.accountDisabledSignedOut":
    "මෙම ගිණුම පරිපාලකයෙකු විසින් අක්‍රිය කර ඇති නිසා ඔබගේ සැසිය අවසන් කරන ලදී. ඔබගේ ප්‍රෝෆයල් සහ සංස්කෘතික අන්තර්ගතය තවමත් සුරැකී ඇත.",

  // Register
  "auth.registerTitle": "ඔබේ ගිණුම සාදන්න",
  "auth.registerSubtitle": "ප්‍රජා ඉගෙනුම් කඳවුරුවලට එක්වීමට ලියාපදිංචි වන්න.",
  "auth.fullNameLabel": "සම්පූර්ණ නම",
  "auth.fullNamePlaceholder": "ඔබේ නම ඇතුළත් කරන්න (උදා: Dadi Rukmani)",
  "auth.passwordMinPlaceholder": "අවම අක්ෂර 8ක්",
  "auth.confirmPasswordLabel": "මුර පදය තහවුරු කරන්න",
  "auth.confirmPasswordPlaceholder": "ඔබේ මුර පදය නැවත ඇතුළත් කරන්න",
  "auth.createAccount": "ගිණුමක් සාදන්න",
  "auth.alreadyHaveAccount": "දැනටමත් ගිණුමක් තිබේද?",
  "auth.registerFailed": "ලියාපදිංචිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.",

  // Validation
  "auth.fullNameRequired": "සම්පූර්ණ නම අවශ්‍යයි",
  "auth.nameTooShort": "නම අක්ෂර 2කට වැඩි විය යුතුය",
  "auth.emailRequired": "විද්‍යුත් තැපෑල අවශ්‍යයි",
  "auth.emailInvalid": "වලංගු විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න",
  "auth.confirmPasswordRequired": "ඔබේ මුර පදය තහවුරු කරන්න",

  // Mock auth outcomes
  "auth.noAccountFound": "මෙම විද්‍යුත් තැපෑලට ගිණුමක් හමු නොවීය",
  "auth.incorrectPassword": "වැරදි මුර පදයකි",
  "auth.emailAlreadyExists": "මෙම විද්‍යුත් තැපෑලෙන් ගිණුමක් දැනටමත් පවතී",

  // Role selection
  "auth.roleTitle": "ඔබ HeritEdge භාවිතා කරන්නේ කෙසේද?",
  "auth.roleSubtitle":
    "ඔබට වඩාත්ම ගැලපෙන භූමිකාව තෝරන්න. එය පසුව ඕනෑම විටක වෙනස් කළ හැක.",
  "auth.roleElderTitle": "මම වැඩිහිටියෙක්",
  "auth.roleElderDesc": "ඔබේ දැනුම, කතා, මුඛ ගීත සහ ජන සම්ප්‍රදායන් බෙදා දෙන්න.",
  "auth.roleLearnerTitle": "මම ඉගෙන ගන්නෙක්",
  "auth.roleLearnerDesc":
    "දේශීය භාෂා සහ සංස්කෘතික මතකයන් ඉගෙන ගෙන, සොයාගෙන, සුරැකීමට උපකාර කරන්න.",
  "auth.roleSaveFailed": "ඔබේ භූමිකාව සුරකින ලැබුණේ නැත. නැවත උත්සාහ කරන්න.",
  "auth.continue": "ඉදිරියට යන්න",
  "auth.continueWithCount": "ඉදිරියට යන්න ({count} ක් තෝරාගත්තා)",

  // Profile setup
  "auth.profileSetupTitle": "ප්‍රොෆයිල් සකස් කිරීම",
  "auth.displayNameLabel": "පෙන්වන නම",
  "auth.displayNamePlaceholder": "ඔබේ පෙන්වන නම ඇතුළත් කරන්න",
  "auth.langCommunityLabel": "ප්‍රධාන භාෂාව / ප්‍රජාව",
  "auth.langCommunityPlaceholder": "උදා: මෛථිලි (උතුරු බිහාර)",
  "auth.introLabel": "කෙටි හැඳින්වීම",
  "auth.introPlaceholder": "ඔබ ගැන අපට කියන්න (අවශ්‍ය නැත)",
  "auth.knowledgeAreasLabel": "දැනුම් ක්ෂේත්‍ර",
  "auth.completeProfile": "ප්‍රොෆයිල් සම්පූර්ණ කරන්න",
  "auth.skipForNow": "දැනට මඟ හරින්න",

  // Cultural interests
  "auth.interestsTitle": "අභිලාෂ",
  "auth.interestsSubtitle": "ඔබට වැඩිපුරම අදාළ වන මාතෘකා තෝරන්න",
  "auth.selectOneInterest": "අවම වශයෙන් අභිලාෂයක් තෝරන්න",
};
