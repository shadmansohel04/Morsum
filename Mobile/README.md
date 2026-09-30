# Morsum Mobile

The Mobile directory contains the Expo React Native client for Morsum, a social food journal with image uploads, food recognition, pantry history, recipes, location-aware features, and real-time chat.

## Overview

- Capture or upload food images and publish daily posts
- Recognize food with the inference service
- Browse a social feed, reactions, spotlights, and pantry history
- Save and browse recipes
- Manage profiles, friends, and location-based features
- Exchange messages through the backend WebSocket service

## Technology Stack

- **React 19.1.0** - UI framework
- **React Native 0.81.4** - Mobile platform
- **Expo 54.0.2** - Development and deployment platform
- **TypeScript ~5.9.2** - Type-safe JavaScript
- **Expo Router ~6.0.1** - File-based routing
- **React Native Maps 1.20.1** - Map functionality
- **React Navigation ^7.1.6** - Navigation management
- **Reanimated ~4.1.0** - Smooth animations
- **Async Storage 2.2.0** - Local data persistence

## Prerequisites

- Node.js with npm
- Expo CLI through the project scripts
- Android Studio and an Android emulator/device for Android development, or Xcode for iOS development
- A reachable Backend service

## Install and run

From this directory:

```powershell
npm install
npm start
```

The Expo developer menu can then open the app in a simulator, on a connected device, or in a web browser. The package scripts also provide:

```powershell
npm run android
npm run ios
npm run web
npm run lint
```

Use a development build for native features that are unavailable in Expo Go:

```powershell
npx expo run:android
npx expo run:ios
```

## Service configuration

The app reads service URLs from `expo.extra` in [app.json](app.json):

| Key | Current purpose |
| --- | --- |
| `backendURI` | Spring Boot REST API, currently `https://foodskitest.onrender.com` |
| `foodMSUri` | Food-recognition service, currently `http://34.130.248.52:3000` |

Screens read `backendURI` through `Constants.expoConfig.extra.backendURI`. Update `app.json` for a local or staging backend, then restart Expo so the manifest is rebuilt. A device must be able to reach the host; `localhost` from a physical phone refers to the phone itself, not the development computer.

The app stores the JWT returned by `/account/login` in Async Storage under `jwt` and sends it as an `Authorization` header to protected endpoints.

## Project Structure

Expo Router maps the `app/` directory to screens and navigation:

- `app/(uauth)` contains login and account creation
- `app/(tabs)/(home)` contains the feed, post flow, comments, and countdown flow
- `app/(tabs)/(newupload)` contains the main upload flow
- `app/(tabs)/(pantry)` contains saved post history and monthly views
- `app/(tabs)/(profile)` contains profile, friends, and profile posts
- `constants/` contains shared colors, dimensions, sample data, and helpers
- `assets/` contains images and fonts

The root layout and tab layouts are in `app/index.jsx` and `app/(tabs)/_layout.jsx`.

## Backend dependencies

The mobile app expects the Backend API to be available for authentication, posts, profiles, recipes, pantry data, and chat. The backend exposes the STOMP SockJS endpoint at `/ws` for messaging. Image uploads use the multipart field `frame` and require a valid JWT.

The inference service is a separate deployment. Its `/detect` endpoint accepts an image under the `frame` field and returns a recognized food class and confidence. Keep both service URLs reachable from the target device.

## Troubleshooting

- If the app cannot connect, verify the two URLs in `app.json` and test them from the device's network.
- If login succeeds but later requests fail, clear the app's Async Storage and sign in again to refresh the JWT.
- If camera, location, photo library, or notification features do not work, check the permissions declared in `app.json` and rebuild the native app after changing them.
- If native modules are missing, use `npx expo run:android` or `npx expo run:ios` instead of relying on Expo Go.
