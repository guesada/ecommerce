import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Produto não encontrado.</p>
        <Link to="/products" className="btn-primary mt-4">
          Voltar aos Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar aos Produtos
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image_url || 'https://via.placeholder.com/600x600?text=Produto'}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.category && (
              <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
          </div>

          <div className="text-3xl font-bold text-primary-600">
            R$ {product.price.toFixed(2)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Estoque</h3>
            <p className="text-gray-600">
              {product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto indisponível'}
            </p>
          </div>

          {/* Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.stock))}
                  className="input w-24"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full py-3 text-lg flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <div className="text-center py-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Produto indisponível no momento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 