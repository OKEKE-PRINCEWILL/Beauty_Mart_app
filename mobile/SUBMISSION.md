# Beauty Mart mobile task

- Website: https://beauty-mart-app.vercel.app
- Android APK build: https://expo.dev/accounts/swagun/projects/beauty-mart-mobile/builds/c62fc8d7-1846-4f9c-a90e-7fa5e11d61b7
- Mobile source: the `mobile` folder in https://github.com/OKEKE-PRINCEWILL/Beauty_Mart_app
- Shared API: https://beauty-mart-api.onrender.com

## Installation

On the completed Android build page, select **Install** and download the APK. Install it on Android 7 or newer, then open Beauty Mart. The preview APK runs directly without Expo Go, Metro, or a QR code.

## Demonstration checklist

1. Sign in to the website and Android app using the same Google account.
2. Keep the mobile shopping bag open. Add a product on the website and show it appearing on mobile after the next cart refresh (every 2.5 seconds while the app is open).
3. Change the quantity on mobile, then open or refresh the website cart and confirm the same quantity.
4. Restart the Android app and confirm the saved account and cart load.

Record the demonstration and include the APK/build link, website link, and source repository in the submission. An emulator can check native app behavior on Windows; the assignment's physical-phone test still requires a phone.

## Validation record

- TypeScript and lint passed.
- Production API health check passed and returned 24 products.
- Android Google OAuth registration is configured for the app package and EAS signing certificate.
- Google sign-in and authenticated cart synchronization still require an account/device test; configuration alone does not verify these flows.
