# Implementation Plan - Capacitor Android Setup

Initialize and configure Capacitor in the React/Vite frontend to prepare the codebase for building an Android APK.

## Proposed Changes

### Frontend CLI Configuration & Dependency Setup
* **Install dependencies**: Install `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` in the frontend directory.
* **Initialize Capacitor**: Run `npx cap init` to configure the application name (`Agro PTE Tracker`), package ID (`com.agro.ptetracker`), and web directory (`dist`).
* **Build Web Assets**: Run `npm run build` to compile the Vite application into static files.
* **Add Android Platform**: Run `npx cap add android` to generate the native Android project structure.
* **Sync Configuration**: Run `npx cap sync` to synchronize the built web resources with the native Android project.

## Verification Plan

### Automated Commands
- Check that Capacitor packages are installed.
- Verify `capacitor.config.json` or `capacitor.config.ts` exists and has `webDir` set to `dist`.
- Verify the `android/` directory is created.
