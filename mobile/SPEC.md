# HeritEdge — Project Specification

## Project Overview

**HeritEdge** is a mobile application for local language and culture preservation. It connects elders who hold cultural knowledge with youth who want to learn and contribute, creating an intergenerational bridge for heritage preservation.

## Purpose

- Preserve endangered local languages and cultural practices
- Connect knowledge holders (elders) with learners (youth)
- Create a sustainable platform for cultural documentation
- Empower communities to safeguard their heritage

## Technology Stack

| Technology | Version |
|---|---|
| React Native | 0.81.5 |
| Expo SDK | 54 |
| TypeScript | 5.9 |
| Expo Router | 6.0 |

**Development approach:** Frontend first, local/mock data for Sprint 1. No backend, database, or authentication implementation yet.

## User Roles

### Elder

- Shares cultural knowledge
- Creates cultural content (stories, songs, practices)
- Collaborates with youth contributors
- **UX requirement:** Very simple and accessible interface

### Youth

- Discovers cultural knowledge
- Finds and connects with elders
- Requests collaboration
- Contributes translations, transcriptions, and cultural context

### Admin

- Future administrator role
- **Not part of Sprint 1**

## UX Principles

### General

- Mobile-first responsive design
- Clean, modern interface
- Warm and culturally respectful tone
- Simple navigation and clear hierarchy
- Accessible to all skill levels
- **Not a social media clone**

### Elder-Specific UX

- Large readable text (minimum 16px body)
- Large touch targets (minimum 44x44pt)
- Clear, descriptive labels
- Simple navigation with minimal steps
- Minimal cognitive load
- Avoid unnecessary complexity or jargon

## Design Guidelines

- Follow the existing Figma design as the visual reference
- Maintain consistent visual language throughout
- **Primary action/button color: RED**
- Do not introduce green or other primary colors without justification
- Do not redesign the visual language without reason

## Sprint 1 — Scope

### Stories

| ID | Story | Status |
|---|---|---|
| HE-16 | User Registration | Pending |
| HE-17 | Select User Role | Pending |
| HE-18 | Login and Logout | Pending |
| HE-19 | Manage Profile | Pending |
| HE-20 | Cultural Interests | Pending |

### Sprint 1 User Flow

**New User:**
```
Splash → Welcome → Register → Role Selection → Profile Setup → Cultural Interests → Home
```

**Returning User:**
```
Login → Home
```

**Authenticated Actions:**
```
Home → Profile → Edit Profile / Cultural Interests / Logout
```

### Sprint 1 Technical Constraints

- Local/mock data only
- No MongoDB integration
- No Express backend
- No JWT authentication
- No real API calls
- No admin features

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── _layout.tsx       # Root layout
│   └── index.tsx         # Home screen
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   ├── index.ts      # Component exports
│   │   ├── AppButton.tsx
│   │   ├── AppCard.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppInput.tsx
│   │   ├── AppText.tsx
│   │   ├── LoadingIndicator.tsx
│   │   └── SelectionChip.tsx
│   └── theme/            # Design system tokens
│       ├── index.ts      # Theme exports
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── layout.ts
├── assets/               # Images, fonts, icons
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── SPEC.md               # This file
```

## Development Rules

1. **Do not implement features** beyond what is specified for the current sprint
2. **Keep the project in a clean, working state** at all times
3. **Run TypeScript checks** before committing: `npx tsc --noEmit`
4. **Test bundling** after significant changes: `npx expo export --platform android`
5. **Follow the design system** — no ad-hoc color or style changes
6. **Use mock data** for all features in Sprint 1
7. **Prioritize elder accessibility** in all UI decisions

## Future Sprints (Out of Scope)

- Backend API (Express)
- Database integration (MongoDB)
- JWT authentication
- Real-time features
- Admin dashboard
- Content management
- Elder-youth collaboration tools
- Push notifications

---

*Last updated: Sprint 1 Planning*
