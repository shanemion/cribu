# Dating App

A modern dating application built with React Native, Expo, and Firebase.

## Features

- User authentication (email/password)
- Profile creation and management
- Photo upload and management
- Swipe-based matching system
- Real-time chat with matches
- Location-based matching
- User preferences and filters

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- iOS Simulator (for Mac) or Android Emulator

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd dating-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

4. Update Firebase configuration:
   - Open `src/services/firebase.ts`
   - Replace the `firebaseConfig` object with your Firebase project configuration

5. Start the development server:
```bash
npm start
```

6. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── navigation/     # Navigation configuration
  ├── screens/        # Screen components
  ├── services/       # Firebase and other services
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  └── assets/         # Images and other static assets
```

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication and set up Email/Password sign-in
3. Create a Firestore database
4. Set up Storage for user photos
5. Update security rules for Firestore and Storage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
