/* eslint-env jest */
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  useHideAnimation: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');


jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    mergeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    multiMerge: jest.fn(() => Promise.resolve()),
  },
}));


jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
    hasString: jest.fn(() => Promise.resolve(false)),
  },
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

const MockIcon = 'Icon';
jest.mock('@react-native-vector-icons/material-icons', () => ({
  MaterialIcons: MockIcon,
}));
jest.mock('@react-native-vector-icons/feather', () => ({
  Feather: MockIcon,
}));
jest.mock('@react-native-vector-icons/octicons', () => ({
  Octicons: MockIcon,
}));
jest.mock('@react-native-vector-icons/ionicons', () => ({
  Ionicons: MockIcon,
}));