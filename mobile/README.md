# Beauty Mart Mobile

Expo and React Native Android app connected to the existing Beauty Mart API.

## Test the standalone Android app

Build an installable APK with `npx eas-cli@latest build --platform android --profile preview`. Download it from the completed EAS build page, install it on an Android 7 or newer device, and open Beauty Mart. This build includes the app and does not require Expo Go, Metro, or a QR code.

For JavaScript-only changes, run `npx eas-cli@latest workflow:run .eas/workflows/android-preview.yml --wait`. The manual workflow compares native fingerprints, repackages a compatible preview APK, and creates a full native build when no matching APK exists.

## Run the development preview

1. Install the Android development APK from the EAS build page on your phone.
2. Start Metro from this folder with `pnpm exec expo start --dev-client`.
3. Open the Beauty Mart development app and connect it to Metro.

The product catalog is public and loads from the production API. The shared cart uses the existing authenticated `/api/cart` endpoints. While signed in, the app refreshes the cart every 2.5 seconds so a change on the website appears on the phone shortly after.

## Google sign-in

Google sign-in sends the Google identity token to the same `/api/auth/google` endpoint used by the website and stores the Beauty Mart session token with Android secure storage. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the existing web client ID and create an Android OAuth client for package `com.beautymart.app` using the SHA-1 fingerprint from the EAS Android signing key.

The Google native sign-in module is not part of Expo Go. Use the standalone preview APK or a custom development build to test sign-in. EAS builds the Android app in the cloud; no Mac or Apple membership is needed.

Set `EXPO_PUBLIC_API_URL` if using a different backend. Relative product images are served by the website; set `EXPO_PUBLIC_STOREFRONT_URL` if using a different storefront. Do not put private credentials in this file.
