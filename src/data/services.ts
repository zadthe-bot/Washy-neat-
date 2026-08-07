import { ServiceItem } from '../types';

export const WASHY_NEAT_SERVICES: ServiceItem[] = [
  {
    id: 'wash_fold',
    name: 'Wash & Fold',
    category: 'wash',
    description: 'Everyday clothes washed, tumbled dried & neatly folded.',
    price: 3.50,
    unit: 'kg',
    iconName: 'Shirt',
    estimatedTime: '24 Hours',
    popular: true
  },
  {
    id: 'wash_iron',
    name: 'Wash & Steam Iron',
    category: 'iron',
    description: 'Full laundering with crisp steam pressing and custom hangers.',
    price: 2.20,
    unit: 'item',
    iconName: 'Sparkles',
    estimatedTime: '24-48 Hours',
    popular: true
  },
  {
    id: 'dry_clean_suit',
    name: 'Dry Cleaning (Suits & Dresses)',
    category: 'dry_clean',
    description: 'Delicate eco-solvent dry cleaning for suits, formal dresses & coats.',
    price: 12.00,
    unit: 'item',
    iconName: 'Briefcase',
    estimatedTime: '48 Hours'
  },
  {
    id: 'shoe_care',
    name: 'Sneaker & Shoe Revival',
    category: 'shoes',
    description: 'Deep manual scrubbing, sole whitening & anti-bacterial ozone treatment.',
    price: 15.00,
    unit: 'pair',
    iconName: 'Footprints',
    estimatedTime: '72 Hours',
    popular: true
  },
  {
    id: 'heavy_duvet',
    name: 'Bedding, Duvets & Rugs',
    category: 'heavy',
    description: 'Sanitizing deep wash for bulky duvets, comforters, and curtains.',
    price: 18.50,
    unit: 'item',
    iconName: 'BedDouble',
    estimatedTime: '48 Hours'
  },
  {
    id: 'stain_removal',
    name: 'Stain & Leather Care',
    category: 'special',
    description: 'Targeted enzyme stain treatment for tough oil, wine & ink spots.',
    price: 8.00,
    unit: 'item',
    iconName: 'ShieldAlert',
    estimatedTime: '24 Hours'
  }
];

export const TIME_SLOTS = [
  '08:00 AM - 11:00 AM',
  '11:00 AM - 02:00 PM',
  '02:00 PM - 05:00 PM',
  '05:00 PM - 08:00 PM'
];
