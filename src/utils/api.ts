import { Product, User, Review } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${res.status}`);
  }
  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  // Auth & Profiles
  auth: {
    async register(
      nameOrPayload: string | { name: string; email: string; avatarEmoji?: string; role?: string; buyerType?: string },
      email?: string,
      avatarEmoji?: string,
      role?: string
    ): Promise<{ user: User; walletBalance: number }> {
      const body = typeof nameOrPayload === 'string'
        ? { name: nameOrPayload, email, avatarEmoji, role }
        : nameOrPayload;
      return fetchJson<{ user: User; walletBalance: number }>(`/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    async login(email: string): Promise<{ user: User; walletBalance: number }> {
      return fetchJson<{ user: User; walletBalance: number }>(`/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    async updateProfile(email: string, profile: Partial<User>): Promise<{ success: boolean; user: User }> {
      return fetchJson<{ success: boolean; user: User }>(`/api/auth/profile`, {
        method: 'POST',
        body: JSON.stringify({ email, profile }),
      });
    },
    async getWalletBalance(email: string): Promise<number> {
      const data = await fetchJson<{ balance: number }>(`/api/auth/wallet/${encodeURIComponent(email)}`);
      return data.balance;
    },
    async updateWalletBalance(email: string, balance: number): Promise<boolean> {
      const data = await fetchJson<{ success: boolean }>(`/api/auth/wallet`, {
        method: 'POST',
        body: JSON.stringify({ email, balance }),
      });
      return data.success;
    },
  },

  // Products
  products: {
    async getAll(): Promise<Product[]> {
      return fetchJson<Product[]>(`/api/products`);
    },
    async create(product: Partial<Product>): Promise<Product> {
      return fetchJson<Product>(`/api/products`, {
        method: 'POST',
        body: JSON.stringify(product),
      });
    },
    async update(id: string, product: Partial<Product>): Promise<Product> {
      return fetchJson<Product>(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
    },
    async delete(id: string): Promise<boolean> {
      const data = await fetchJson<{ success: boolean }>(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return data.success;
    },
    async addReview(productId: string, review: { author: string; rating: number; comment: string; avatarColor?: string }): Promise<{ product: Product; review: Review }> {
      return fetchJson<{ product: Product; review: Review }>(`/api/products/${encodeURIComponent(productId)}/review`, {
        method: 'POST',
        body: JSON.stringify(review),
      });
    },
  },

  // Shop details
  shop: {
    async get(email: string): Promise<any> {
      return fetchJson<any>(`/api/shop/${encodeURIComponent(email)}`);
    },
    async update(email: string, details: any): Promise<any> {
      return fetchJson<any>(`/api/shop/${encodeURIComponent(email)}`, {
        method: 'POST',
        body: JSON.stringify(details),
      });
    },
  },

  // Orders
  orders: {
    async get(params: { buyerEmail?: string; sellerEmail?: string } = {}): Promise<any[]> {
      const query = new URLSearchParams();
      if (params.buyerEmail) query.set('buyerEmail', params.buyerEmail);
      if (params.sellerEmail) query.set('sellerEmail', params.sellerEmail);
      return fetchJson<any[]>(`/api/orders?${query.toString()}`);
    },
    async create(order: any): Promise<any> {
      return fetchJson<any>(`/api/orders`, {
        method: 'POST',
        body: JSON.stringify(order),
      });
    },
  },

  // Gifts
  gifts: {
    async getAll(): Promise<any[]> {
      return fetchJson<any[]>(`/api/gifts`);
    },
    async get(idOrCode: string): Promise<any> {
      return fetchJson<any>(`/api/gifts/${encodeURIComponent(idOrCode)}`);
    },
    async create(gift: any): Promise<any> {
      return fetchJson<any>(`/api/gifts`, {
        method: 'POST',
        body: JSON.stringify(gift),
      });
    },
    async claim(idOrCode: string, claimantEmail?: string, claimantName?: string): Promise<any> {
      return fetchJson<any>(`/api/gifts/${encodeURIComponent(idOrCode)}/claim`, {
        method: 'POST',
        body: JSON.stringify({ claimantEmail, claimantName }),
      });
    },
  },

  // Messages / Whispers
  messages: {
    async get(params: { buyerEmail?: string; makerEmail?: string } = {}): Promise<any[]> {
      const query = new URLSearchParams();
      if (params.buyerEmail) query.set('buyerEmail', params.buyerEmail);
      if (params.makerEmail) query.set('makerEmail', params.makerEmail);
      return fetchJson<any[]>(`/api/messages?${query.toString()}`);
    },
    async send(msg: { sender: string; text: string; buyerEmail?: string; makerEmail?: string; time?: string }): Promise<any> {
      return fetchJson<any>(`/api/messages`, {
        method: 'POST',
        body: JSON.stringify(msg),
      });
    },
  },

  // Maintenance
  maintenance: {
    async get(): Promise<any> {
      return fetchJson<any>(`/api/maintenance`);
    },
    async update(config: any): Promise<any> {
      return fetchJson<any>(`/api/maintenance`, {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },
  },
  
  // Custom Commissions
  commissions: {
    async craft(request: { itemType: string; materials: string[]; theme: string; details: string }): Promise<any> {
      return fetchJson<any>(`/api/craft-commission`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
    async generateStory(productName: string, materials: string[]): Promise<{ story: string }> {
      return fetchJson<{ story: string }>(`/api/generate-fairy-story`, {
        method: 'POST',
        body: JSON.stringify({ productName, materials }),
      });
    },
  },
  
  // DevOps & Security
  devops: {
    async getLogs(): Promise<any[]> {
      return fetchJson<any[]>(`/api/v1/admin/devops/logs`);
    },
    async getIncidents(): Promise<any[]> {
      return fetchJson<any[]>(`/api/v1/admin/devops/incidents`);
    },
    async getMetrics(): Promise<any> {
      return fetchJson<any>(`/api/v1/admin/devops/metrics`);
    },
    async simulateIncident(ip?: string, reason?: string, endpoint?: string): Promise<any> {
      return fetchJson<any>(`/api/v1/admin/devops/simulate-incident`, {
        method: 'POST',
        body: JSON.stringify({ ip, reason, endpoint }),
      });
    },
    async clearIncidents(): Promise<any> {
      return fetchJson<any>(`/api/v1/admin/devops/clear-incidents`, {
        method: 'POST',
      });
    }
  }
};
