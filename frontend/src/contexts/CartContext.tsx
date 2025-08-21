import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  const refreshCart = async () => {
    if (!user || !token) {
      setItems([]);
      setTotal(0);
      setItemCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/cart');
      const { items: cartItems, total: cartTotal, itemCount: cartItemCount } = response.data;
      
      setItems(cartItems);
      setTotal(cartTotal);
      setItemCount(cartItemCount);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Erro ao carregar carrinho');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, token]);

  const addToCart = async (productId: number, quantity: number) => {
    if (!user || !token) {
      toast.error('Faça login para adicionar produtos ao carrinho');
      return;
    }

    try {
      await api.post('/cart/add', { product_id: productId, quantity });
      await refreshCart();
      toast.success('Produto adicionado ao carrinho!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao adicionar ao carrinho';
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!user || !token) return;

    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await refreshCart();
      toast.success('Quantidade atualizada!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao atualizar quantidade';
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user || !token) return;

    try {
      await api.delete(`/cart/${itemId}`);
      await refreshCart();
      toast.success('Produto removido do carrinho!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao remover do carrinho';
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user || !token) return;

    try {
      await api.delete('/cart');
      await refreshCart();
      toast.success('Carrinho limpo!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao limpar carrinho';
      toast.error(message);
      throw error;
    }
  };

  const value: CartContextType = {
    items,
    total,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 