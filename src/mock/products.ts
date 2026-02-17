/**
 * Mock Product Catalog
 * Simulates a real e-commerce product database
 */

import type { Product } from '../types/topsort';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'electronics',
    vendor: 'AudioTech',
    rating: 4.7,
    reviewCount: 2341,
  },
  {
    id: 'prod-002',
    name: 'Smart Fitness Watch',
    description: 'Track your health metrics, workouts, and stay connected with this advanced smartwatch.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'electronics',
    vendor: 'FitGear',
    rating: 4.5,
    reviewCount: 1876,
  },
  {
    id: 'prod-003',
    name: 'Organic Coffee Beans (1kg)',
    description: 'Single-origin Arabica beans from Colombia. Medium roast, rich flavor profile.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    category: 'food',
    vendor: 'BeanMasters',
    rating: 4.8,
    reviewCount: 567,
  },
  {
    id: 'prod-004',
    name: 'Ergonomic Office Chair',
    description: 'Full lumbar support, adjustable armrests, and breathable mesh back for all-day comfort.',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
    category: 'furniture',
    vendor: 'ErgoWorks',
    rating: 4.6,
    reviewCount: 892,
  },
  {
    id: 'prod-005',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with 360° sound and 20-hour playtime. Perfect for outdoor adventures.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    category: 'electronics',
    vendor: 'SoundWave',
    rating: 4.4,
    reviewCount: 3102,
  },
  {
    id: 'prod-006',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit keyboard with Cherry MX switches. Built for competitive gaming.',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    category: 'electronics',
    vendor: 'GamePro',
    rating: 4.7,
    reviewCount: 1543,
  },
  {
    id: 'prod-007',
    name: 'Stainless Steel Water Bottle',
    description: 'Vacuum insulated, keeps drinks cold for 24hrs or hot for 12hrs. BPA-free.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    category: 'lifestyle',
    vendor: 'HydroLife',
    rating: 4.9,
    reviewCount: 4521,
  },
  {
    id: 'prod-008',
    name: 'Yoga Mat Premium',
    description: 'Extra thick, non-slip surface. Eco-friendly materials. Includes carrying strap.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    category: 'fitness',
    vendor: 'ZenFit',
    rating: 4.6,
    reviewCount: 789,
  },
  {
    id: 'prod-009',
    name: 'USB-C Hub 7-in-1',
    description: 'HDMI, USB 3.0, SD card reader, and 100W power delivery. Works with all laptops.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400',
    category: 'electronics',
    vendor: 'TechConnect',
    rating: 4.3,
    reviewCount: 2156,
  },
  {
    id: 'prod-010',
    name: 'Indoor Plant Set (3 Pack)',
    description: 'Low-maintenance succulents in decorative ceramic pots. Perfect for home or office.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
    category: 'home',
    vendor: 'GreenThumb',
    rating: 4.5,
    reviewCount: 1234,
  },
  {
    id: 'prod-011',
    name: 'Leather Laptop Sleeve',
    description: 'Genuine leather sleeve fits 13-15" laptops. Soft microfiber interior.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    category: 'accessories',
    vendor: 'CraftedGoods',
    rating: 4.8,
    reviewCount: 678,
  },
  {
    id: 'prod-012',
    name: 'Smart LED Bulb (4 Pack)',
    description: '16 million colors, voice control compatible. Works with Alexa and Google Home.',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1558171013-50e1d2c3c7da?w=400',
    category: 'home',
    vendor: 'BrightHome',
    rating: 4.4,
    reviewCount: 3456,
  },
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(p => p.category === category);
}

export function getProductsByIds(ids: string[]): Product[] {
  return mockProducts.filter(p => ids.includes(p.id));
}
