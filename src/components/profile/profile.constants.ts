import type { ProfileMenuEntryConfig } from './profile.types';

/** Shown in the profile footer; replace with native/build metadata when wired. */
export const PROFILE_APP_VERSION = '1.0.0';

export const PROFILE_MENU_ENTRIES: ProfileMenuEntryConfig[] = [
  {
    id: 'orders',
    title: 'Orders',
    icon: { family: 'feather', name: 'shopping-bag', color: '#16A34A' },
  },
  {
    id: 'refer',
    title: 'Refer and Earn',
    icon: { family: 'feather', name: 'gift', color: '#DB2777' },
    badge: { kind: 'pill', label: 'Earn More!', tone: 'green' },
  },
  {
    id: 'my-devices',
    title: 'My Devices',
    icon: { family: 'material', name: 'monitor-weight', color: '#0D9488' },
    badge: { kind: 'pill', label: 'NEW', tone: 'greenDark' },
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    icon: { family: 'feather', name: 'file-text', color: '#0D9488' },
  },
  {
    id: 'saved',
    title: 'Saved for Later',
    icon: { family: 'feather', name: 'heart', color: '#16A34A' },
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: { family: 'feather', name: 'bell', color: '#16A34A' },
    badge: { kind: 'count', source: 'notifications' },
  },
  {
    id: 'consultations',
    title: 'My Consultations',
    icon: { family: 'ionicons', name: 'medkit-outline', color: '#64748B' },
  },
  {
    id: 'help',
    title: 'Need Help',
    icon: { family: 'feather', name: 'headphones', color: '#16A34A' },
  },
  {
    id: 'address',
    title: 'Manage Address',
    icon: { family: 'feather', name: 'map-pin', color: '#0D9488' },
  },
  {
    id: 'refund',
    title: 'Set Refund Preferences',
    icon: { family: 'material', name: 'account-balance', color: '#0D9488' },
  },
  {
    id: 'legal',
    title: 'Legal',
    icon: { family: 'material', name: 'gavel', color: '#0D9488' },
  },
];
