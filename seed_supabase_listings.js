import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://ctzrmplgvjssgycfsayg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0enJtcGxndmpzc2d5Y2ZzYXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzIwMDMsImV4cCI6MjEwNTgwODAwM30.CkrklvTOsg6xc79fKk8NHvzuz8jvVSG_deDpvVIYquI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const generateUUID = () => crypto.randomUUID();

const INITIAL_LISTINGS = [
  {
    id: generateUUID(),
    farmer_name: 'Matsanjeni Farm',
    farmer_avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    product_type: 'Fresh Spinach',
    category: 'vegetables',
    description: 'Fresh, locally grown spinach harvest. Rich in nutrients and perfect for home cooking, local markets, or restaurants in Manzini and surrounding areas.',
    quantity: 120,
    unit: 'kg',
    price: 20,
    currency: 'E',
    harvest_date: '2026-09-22',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Matsanjeni Farm',
    location: 'Matsanjeni, Manzini Region',
    latitude: -26.5000,
    longitude: 31.3667,
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 24
  },
  {
    id: generateUUID(),
    farmer_name: 'Mahlase Farm',
    farmer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    product_type: 'Fresh Farm Tomatoes',
    category: 'vegetables',
    description: 'Juicy, vine-ripened red tomatoes harvested daily. Great for stewing, salad, and commercial food vendors. Picked at peak ripeness.',
    quantity: 350,
    unit: 'kg',
    price: 15,
    currency: 'E',
    harvest_date: '2026-09-23',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Manzini South',
    location: 'Manzini South, Eswatini',
    latitude: -26.4833,
    longitude: 31.3667,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviews_count: 18
  },
  {
    id: generateUUID(),
    farmer_name: 'Piggs Peak Organic Cooperative',
    farmer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    product_type: 'Free Range Eggs',
    category: 'poultry',
    description: 'Fresh free-range jumbo eggs from grain-fed hens raised outdoors. Strong shells and rich yellow yolks.',
    quantity: 80,
    unit: 'dozen',
    price: 40,
    currency: 'E',
    harvest_date: '2026-09-24',
    status: 'available',
    is_verified: true,
    settlement_type: 'rural',
    inkhundla: 'Piggs Peak',
    location: 'Piggs Peak, Hhohho Region',
    latitude: -25.9667,
    longitude: 31.2500,
    images: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviews_count: 42
  }
];

async function seedListings() {
  console.log('Seeding INITIAL_LISTINGS into Supabase...');

  // Attempt insert
  const { data, error } = await supabase.from('listings').insert(INITIAL_LISTINGS).select();

  if (error) {
    console.error('Supabase Error:', error.message);
  } else {
    console.log(`SUCCESS! Inserted ${data ? data.length : 0} listings into Supabase database!`);
    console.log('Inserted listings data:', data);
  }
}

seedListings();
