export interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: number | boolean;
  sort_order?: number;
}

export interface Color {
  id: number;
  name: string;
  hex_code: string;
  slug: string;
}

export interface Size {
  id: number;
  name: string;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  product_count?: number;
}

export interface ProductVariant {
  id?: number;
  variant_id?: number;
  product_id?: number;
  color_id: number;
  size_id: number;
  stock: number;
  color_name?: string;
  color_hex?: string;
  color_slug?: string;
  size_name?: string;
  size_sort?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number | null;
  category_name?: string;
  category_slug?: string;
  active: number;
  featured: number;
  total_stock?: number;
  primary_image: string;
  images: ProductImage[];
  colors?: Color[];
  sizes?: Size[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  cart_id: string; // unique per variant: `${product_id}-${color_id}-${size_id}`
  product_id: number;
  variant_id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  color: { id: number; name: string; hex_code: string };
  size: { id: number; name: string };
  quantity: number;
  max_stock: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface InventoryItem {
  variant_id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  stock: number;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_active: number;
  color_name: string;
  color_hex: string;
  color_slug: string;
  size_name: string;
  primary_image: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  totalOrders: number;
  recentProducts: Product[];
  lowStockVariants: Array<{
    variant_id: number;
    stock: number;
    product_name: string;
    color_name: string;
    size_name: string;
  }>;
}
