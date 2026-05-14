# PillFly Mobile App

This is a React Native project bootstrapped using @react-native-community/cli.

## 🚀 Getting Started

### 1. Start Metro
```sh
npm start
# or
yarn start
```

## Firebase App Distribution CI

The repository includes a GitHub Actions workflow at `.github/workflows/firebase-app-distribution.yml`.

It runs on pushes to `main` and can also be started manually from the Actions tab.

Required repository secrets:

- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_DISTRIBUTION_GROUPS`