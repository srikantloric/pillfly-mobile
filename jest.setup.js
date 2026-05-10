/* eslint-env jest */
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  useHideAnimation: jest.fn(),
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
jest.mock('@react-native-vector-icons/material-design-icons', () => ({
  MaterialDesignIcons: MockIcon,
}));
