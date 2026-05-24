import type { ImageSourcePropType } from 'react-native';

const labPlaceholder = require('../assets/banner/3c0569aa8e5-Diag_HP_Banner_BOGO.jpg');

export type OfferPackage = {
  id: string;
  title: string;
  testCount: number;
  priceForTwo: number;
  pricePerPerson: number;
  description: string;
  image: ImageSourcePropType;
};

export const OFFER_PACKAGES: OfferPackage[] = [
  {
    id: 'bronze-full-body',
    title: 'Comprehensive Bronze Full Body Checkup with Cardiac and Fever Markers',
    testCount: 98,
    priceForTwo: 3399,
    pricePerPerson: 1699,
    description:
      'Designed for adults 40+ focusing on cardiac screening, vitamin status and fever indicators.',
    image: labPlaceholder,
  },
  {
    id: 'silver-full-body',
    title: 'Comprehensive Silver Full Body Checkup with Cardiac Risk Markers',
    testCount: 103,
    priceForTwo: 4399,
    pricePerPerson: 2199,
    description: 'Perfect for adults 50+ aiming for a thorough preventive health checkup.',
    image: labPlaceholder,
  },
  {
    id: 'senior-citizen',
    title: 'Senior Citizen Health Checkup with Diabetes & Bone Profile',
    testCount: 87,
    priceForTwo: 2999,
    pricePerPerson: 1499,
    description:
      'Tailored for seniors 60+ with diabetes monitoring, bone health and vital organ screening.',
    image: labPlaceholder,
  },
  {
    id: 'essential-markers',
    title: 'Essential Health Markers Package with Thyroid & Lipid Profile',
    testCount: 72,
    priceForTwo: 2499,
    pricePerPerson: 1249,
    description:
      'Ideal starter panel covering thyroid, lipids, liver, kidney and complete blood count.',
    image: labPlaceholder,
  },
];
