
import { NextRequest } from 'next/server';

// İkas API Configuration
export const IKAS_CONFIG = {
  API_BASE_URL: process.env.IKAS_API_URL || 'https://api.myikas.com/api/v1',
  API_KEY: process.env.IKAS_API_KEY || '',
  STORE_ID: process.env.IKAS_STORE_ID || '',
  WEBHOOK_SECRET: process.env.IKAS_WEBHOOK_SECRET || '',
};

export interface IkasProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sku: string;
  stock: number;
  images?: string[];
  categoryId?: string;
  brand?: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface IkasOrder {
  id: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  items: IkasOrderItem[];
  shippingAddress?: any;
  billingAddress?: any;
  createdAt: string;
  updatedAt: string;
}

export interface IkasOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IkasCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  gizmoUserId?: string; // Bridge to Gizmo system
}

export class IkasClient {
  private baseURL: string;
  private apiKey: string;
  private storeId: string;

  constructor() {
    this.baseURL = IKAS_CONFIG.API_BASE_URL;
    this.apiKey = IKAS_CONFIG.API_KEY;
    this.storeId = IKAS_CONFIG.STORE_ID;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Store-Id': this.storeId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`İkas API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Product Management
  async getProducts(): Promise<IkasProduct[]> {
    return this.makeRequest('/products');
  }

  async getProduct(productId: string): Promise<IkasProduct> {
    return this.makeRequest(`/products/${productId}`);
  }

  async createProduct(product: Omit<IkasProduct, 'id'>): Promise<IkasProduct> {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(productId: string, updates: Partial<IkasProduct>): Promise<IkasProduct> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getOrders(): Promise<IkasOrder[]> {
    return this.makeRequest('/orders');
  }

  async getOrder(orderId: string): Promise<IkasOrder> {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: IkasOrder['status']): Promise<IkasOrder> {
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Customer Management
  async getCustomers(): Promise<IkasCustomer[]> {
    return this.makeRequest('/customers');
  }

  async getCustomer(customerId: string): Promise<IkasCustomer> {
    return this.makeRequest(`/customers/${customerId}`);
  }

  async createCustomer(customer: Omit<IkasCustomer, 'id' | 'createdAt'>): Promise<IkasCustomer> {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async findCustomerByEmail(email: string): Promise<IkasCustomer | null> {
    try {
      const customers = await this.makeRequest(`/customers?email=${encodeURIComponent(email)}`);
      return customers.length > 0 ? customers[0] : null;
    } catch {
      return null;
    }
  }

  // Inventory Management
  async updateProductStock(productId: string, stock: number): Promise<IkasProduct> {
    return this.makeRequest(`/products/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    });
  }
}

export const ikasClient = new IkasClient();
