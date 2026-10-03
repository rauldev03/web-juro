import type { 
  Product, 
  Category, 
  Color, 
  Size, 
  InventoryItem, 
  DashboardStats,
  User 
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('kkrius_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error en la solicitud');
  }
  return data;
}

export const api = {
  // Auth API
  auth: {
    login: async (email: string, password: string): Promise<{ success: boolean; token: string; user: User }> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse<{ success: boolean; token: string; user: User }>(res);
      if (data.token) {
        localStorage.setItem('kkrius_token', data.token);
        localStorage.setItem('kkrius_user', JSON.stringify(data.user));
      }
      return data;
    },
    getMe: async (): Promise<{ success: boolean; user: User }> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    logout: () => {
      localStorage.removeItem('kkrius_token');
      localStorage.removeItem('kkrius_user');
    }
  },

  // Products API
  products: {
    getAll: async (params?: { category?: string; color?: string; size?: string; search?: string }): Promise<{ data: Product[] }> => {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.color) query.set('color', params.color);
      if (params?.size) query.set('size', params.size);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      return handleResponse(res);
    },
    getAdminAll: async (params?: { category?: string; search?: string }): Promise<{ data: Product[] }> => {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE}/products/admin/all?${query.toString()}`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    getBySlugOrId: async (identifier: string | number, adminMode = false): Promise<{ data: Product }> => {
      const res = await fetch(`${API_BASE}/products/${identifier}${adminMode ? '?admin=true' : ''}`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    create: async (productData: any): Promise<{ success: boolean; data: Product }> => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(productData)
      });
      return handleResponse(res);
    },
    update: async (id: number, productData: any): Promise<{ success: boolean; data: Product }> => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(productData)
      });
      return handleResponse(res);
    },
    toggleStatus: async (id: number, active: boolean): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ active })
      });
      return handleResponse(res);
    },
    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Categories, Colors, Sizes
  categories: {
    getAll: async (): Promise<{ data: Category[] }> => {
      const res = await fetch(`${API_BASE}/categories`);
      return handleResponse(res);
    }
  },
  colors: {
    getAll: async (): Promise<{ data: Color[] }> => {
      const res = await fetch(`${API_BASE}/colors`);
      return handleResponse(res);
    }
  },
  sizes: {
    getAll: async (): Promise<{ data: Size[] }> => {
      const res = await fetch(`${API_BASE}/sizes`);
      return handleResponse(res);
    }
  },

  // Inventory API
  inventory: {
    getAll: async (params?: { search?: string; colorId?: string; sizeId?: string; status?: string }): Promise<{ data: InventoryItem[] }> => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.colorId) query.set('colorId', params.colorId);
      if (params?.sizeId) query.set('sizeId', params.sizeId);
      if (params?.status) query.set('status', params.status);

      const res = await fetch(`${API_BASE}/inventory?${query.toString()}`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    updateStock: async (variantId: number, stock: number): Promise<{ success: boolean; data: any }> => {
      const res = await fetch(`${API_BASE}/inventory/variant/${variantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ stock })
      });
      return handleResponse(res);
    },
    getStats: async (): Promise<{ data: DashboardStats }> => {
      const res = await fetch(`${API_BASE}/inventory/stats`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Image Upload API
  upload: {
    uploadMultiple: async (files: File[]): Promise<{ data: Array<{ image_url: string; is_primary: number; sort_order: number }> }> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`${API_BASE}/upload/multiple`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return handleResponse(res);
    },
    uploadSingle: async (file: File): Promise<{ data: { image_url: string } }> => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/upload/single`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return handleResponse(res);
    }
  },

  // Orders API
  orders: {
    create: async (orderData: {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      customer_address?: string;
      items: Array<{ variant_id: number; product_id: number; quantity: number }>;
      notes?: string;
      payment_method?: string;
    }): Promise<{ success: boolean; order: any; whatsapp_url: string }> => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return handleResponse(res);
    },
    getAll: async (): Promise<{ data: any[] }> => {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  }
};
