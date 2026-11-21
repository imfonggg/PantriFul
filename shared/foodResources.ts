import type { FoodResource } from './types.js'

/**
 * Seed list of food resources near USF Tampa.
 *
 * IMPORTANT: names are real organisations, but addresses, coordinates and hours
 * are best-effort placeholders. Before the demo, check each one on its website
 * or by phone, fix the details, and set `verified: true`.
 */
export const FOOD_RESOURCES: FoodResource[] = [
  {
    id: 'usf-feed-a-bull',
    name: 'Feed-A-Bull Food Pantry (USF)',
    type: 'pantry',
    address: 'USF Tampa campus, Tampa, FL 33620',
    location: { lat: 28.0637, lng: -82.4131 },
    website: 'https://www.usf.edu/student-affairs/feed-a-bull/',
    hours: {
      1: [{ open: '10:00', close: '16:00' }],
      2: [{ open: '10:00', close: '16:00' }],
      3: [{ open: '10:00', close: '16:00' }],
      4: [{ open: '10:00', close: '16:00' }],
      5: [{ open: '10:00', close: '14:00' }],
    },
    eligibility: 'USF students',
    requirements: 'USF ID',
    offers: ['non-perishables', 'fresh produce', 'toiletries'],
    verified: false,
  },
  {
    id: 'feeding-tampa-bay',
    name: 'Feeding Tampa Bay',
    type: 'food_bank',
    address: '4702 Transport Dr, Tampa, FL 33605',
    location: { lat: 27.9726, lng: -82.4108 },
    website: 'https://feedingtampabay.org/',
    hours: {
      1: [{ open: '08:00', close: '17:00' }],
      2: [{ open: '08:00', close: '17:00' }],
      3: [{ open: '08:00', close: '17:00' }],
      4: [{ open: '08:00', close: '17:00' }],
      5: [{ open: '08:00', close: '17:00' }],
    },
    eligibility: 'Anyone in need; also lists partner pantries and mobile pantries',
    offers: ['groceries', 'mobile pantry schedule', 'SNAP help'],
    verified: false,
  },
  {
    id: 'metropolitan-ministries',
    name: 'Metropolitan Ministries',
    type: 'pantry',
    address: '2002 N Florida Ave, Tampa, FL 33602',
    location: { lat: 27.9614, lng: -82.4594 },
    website: 'https://www.metromin.org/',
    hours: {
      1: [{ open: '09:00', close: '16:00' }],
      2: [{ open: '09:00', close: '16:00' }],
      3: [{ open: '09:00', close: '16:00' }],
      4: [{ open: '09:00', close: '16:00' }],
      5: [{ open: '09:00', close: '16:00' }],
    },
    eligibility: 'Hillsborough County residents in need',
    requirements: 'Photo ID',
    offers: ['groceries', 'hot meals', 'family support'],
    verified: false,
  },
  {
    id: 'trinity-cafe',
    name: 'Trinity Café',
    type: 'hot_meal',
    address: '2801 N Nebraska Ave, Tampa, FL 33602',
    location: { lat: 27.9686, lng: -82.4511 },
    website: 'https://www.trinitycafe.org/',
    hours: {
      1: [{ open: '11:00', close: '13:00' }],
      2: [{ open: '11:00', close: '13:00' }],
      3: [{ open: '11:00', close: '13:00' }],
      4: [{ open: '11:00', close: '13:00' }],
      5: [{ open: '11:00', close: '13:00' }],
      6: [{ open: '11:00', close: '13:00' }],
    },
    eligibility: 'Anyone; no questions asked',
    offers: ['free hot lunch'],
    verified: false,
  },
  {
    id: 'salvation-army-tampa',
    name: 'The Salvation Army Tampa',
    type: 'pantry',
    address: '1603 N Florida Ave, Tampa, FL 33602',
    location: { lat: 27.9571, lng: -82.4594 },
    website: 'https://salvationarmyflorida.org/tampa/',
    hours: {
      1: [{ open: '09:00', close: '15:00' }],
      2: [{ open: '09:00', close: '15:00' }],
      3: [{ open: '09:00', close: '15:00' }],
      4: [{ open: '09:00', close: '15:00' }],
    },
    eligibility: 'Individuals and families in need',
    requirements: 'Photo ID, proof of address',
    offers: ['groceries', 'emergency assistance'],
    verified: false,
  },
]
