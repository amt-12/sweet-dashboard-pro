import { Product, Order, Customer } from '../types';

// Using mock data for now, but structured to easily switch to real API calls

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Chocolate Fudge Cake", category: "Cakes", price: 25.00, stock: 12, image: "/placeholder.svg" },
  { id: 2, name: "Vanilla Bean Cupcake", category: "Cupcakes", price: 3.50, stock: 45, image: "/placeholder.svg" },
  { id: 3, name: "Sourdough Loaf", category: "Breads", price: 6.00, stock: 8, image: "/placeholder.svg" },
  { id: 4, name: "Macaron Box (12)", category: "Pastries", price: 18.00, stock: 20, image: "/placeholder.svg" },
  { id: 5, name: "Croissant", category: "Pastries", price: 4.00, stock: 30, image: "/placeholder.svg" },
];

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", customerId: 101, customerName: "Alice Baker", items: "Chocolate Cake, 6 Cupcakes", total: 46.00, status: "Delivered", date: "2023-10-25", paymentStatus: "Paid" },
  { id: "ORD-002", customerId: 102, customerName: "Bob Candy", items: "Sourdough Loaf", total: 6.00, status: "Processing", date: "2023-10-26", paymentStatus: "Paid" },
  { id: "ORD-003", customerId: 103, customerName: "Charlie Dough", items: "Macaron Box", total: 18.00, status: "Pending", date: "2023-10-26", paymentStatus: "Pending" },
];

const API_BASE_URL = '/api'; // Placeholder

export const api = {
  products: {
    getAll: async (): Promise<Product[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...MOCK_PRODUCTS];
    },
    getById: async (id: number): Promise<Product | null> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PRODUCTS.find(p => p.id === id) || null;
    },
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct = { ...product, id: Math.floor(Math.random() * 1000) + 100 };
      MOCK_PRODUCTS.push(newProduct);
      return newProduct;
    },
    update: async (id: number, product: Partial<Product>): Promise<Product> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...product };
        return MOCK_PRODUCTS[index];
      }
      throw new Error("Product not found");
    },
    delete: async (id: number): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS.splice(index, 1);
      }
    }
  },
  orders: {
    getAll: async (): Promise<Order[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...MOCK_ORDERS];
    }
  },
  customers: {
    getAll: async (): Promise<Customer[]> => {
      return [];
    }
  }
};
