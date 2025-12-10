# HoraHub Frontend

A mobile application for HoraHub - an all-in-one Web3 platform that binds all projects within the Horaverse ecosystem together.

## 📱 About

HoraHub Frontend is a React Native mobile application built with Expo, designed to provide a seamless user experience for interacting with the HoraHub Web3 platform. The app serves as a unified interface for managing and accessing various projects within the Horaverse ecosystem.

## 🚀 Tech Stack

- **Framework:** [Expo](https://expo.dev) / React Native
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** Expo Router (file-based routing)
- **Build System:** Metro Bundler

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/CopperTrin/HoraHub-frontend.git
cd HoraHub-frontend
```

2. Install dependencies:
```bash
npm install
```

## 🏃 Running the App

Start the development server:
```bash
npx expo start
```

This will open Expo Dev Tools in your browser. From there, you can:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with the Expo Go app on your physical device

### Development Builds

For a more native experience, you can create a development build:
```bash
npx expo run:ios
# or
npx expo run:android
```

## 📁 Project Structure

```
HoraHub-frontend/
├── app/                    # App screens and navigation (file-based routing)
├── assets/
│   └── images/            # Image assets
├── .cursor/               # Cursor IDE configuration
├── .vscode/               # VS Code configuration
├── app.json               # Expo app configuration
├── babel.config.js        # Babel configuration
├── eslint.config.js       # ESLint configuration
├── metro.config.js        # Metro bundler configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## 🎨 Styling

This project uses NativeWind for styling, which brings the Tailwind CSS experience to React Native. Styles are written using Tailwind utility classes directly in your components:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-blue-600">Hello World</Text>
</View>
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run reset-project` - Reset to a fresh project structure

## 📦 Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

Make sure you have configured EAS (Expo Application Services) before building for production.

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start -c
```

**Dependencies not installing correctly:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## 🌐 Resources

- [HoraHub Website](https://horahub.com)
- [Expo GitHub](https://github.com/expo/expo)
- [React Native Community](https://reactnative.dev/community/overview)

## 👥 Contributors

<a href="https://github.com/CopperTrin/HoraHub-frontend/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CopperTrin/HoraHub-frontend" />
</a>

## 📄 License

This project is proprietary software. All rights reserved.

## 💬 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for the Horaverse ecosystem
