/* eslint-env jest */
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  useHideAnimation: jest.fn(),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));
