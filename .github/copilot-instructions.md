# Copilot Instructions for gymix

## Project Overview
- **gymix** is a modular React 19+ application using Vite for development and build.
- The codebase is organized by feature modules under `components/modules/` (e.g., analytics, concierge-ai, knowledge-base, marketplace, school-hub, etc.).
- Shared UI components and layout elements are in `components/ui/` and `components/layout/`.
- TypeScript is used throughout; types are in `types.ts`.

## Key Patterns & Conventions
- **Feature Modules:** Each major feature (e.g., Analytics, Concierge AI) has its own directory and entry point (e.g., `AnalyticsModule.tsx`). Sub-features are nested (e.g., `analytics/overview/`).
- **Overlays:** UI overlays are in `components/overlays/` and follow a `*Overlay.tsx` naming convention.
- **CSS:** Each module/component has a co-located `.css` file for styles.
- **Icons:** Use `lucide-react` icons, imported via `components/icons.tsx`.
- **Charts:** Use `recharts` for data visualization.
- **AI Integration:** The `@google/genai` package is used for AI features, primarily in the `concierge-ai` module.
- **Context:** App-wide context is managed in `hooks/useAppContext.ts` and `hooks/useConciergeAI.ts`.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (runs Vite)
- **Build:** `npm run build`
- **Preview Build:** `npm run preview`
- **Type Checking:** `npx tsc --noEmit`
- **No explicit test setup** detected; add tests in a `__tests__` or `tests/` folder if needed.

## Integration Points
- **AI:** All AI logic is in `components/modules/concierge-ai/` using `@google/genai`.
- **Navigation:** Main navigation is in `components/layout/MainNavigationSidebar.tsx`.
- **Global State:** Use React context from `hooks/`.

## Examples
- To add a new feature module: create a folder in `components/modules/`, add a `*Module.tsx` entry, and co-locate styles and subfeatures.
- To add a new overlay: add a `*Overlay.tsx` and corresponding CSS in `components/overlays/`.

## References
- `App.tsx` — App entry point, main layout
- `components/layout/` — Global UI structure
- `components/modules/` — Feature modules
- `hooks/` — Context and shared logic
- `package.json` — Scripts, dependencies

---
If you are unsure about a pattern, check for similar files in the relevant directory. When in doubt, follow the structure of existing modules or overlays.
