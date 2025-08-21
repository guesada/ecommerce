import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bem-vindo ao nosso E-commerce
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Descubra produtos incríveis com qualidade e preços imbatíveis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Ver Produtos
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Produtos de Qualidade</h3>
          <p className="text-gray-600">
            Selecionamos cuidadosamente cada produto para garantir a melhor experiência
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Entrega Rápida</h3>
          <p className="text-gray-600">
            Receba seus produtos no conforto da sua casa com entrega rápida e segura
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
          <p className="text-gray-600">
            Suas informações estão protegidas com a mais alta tecnologia de segurança
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Atendimento Premium</h3>
          <p className="text-gray-600">
            Nossa equipe está sempre pronta para ajudar com qualquer dúvida
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-gray-600 mb-6">
          Junte-se a milhares de clientes satisfeitos e descubra o que temos para você
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="btn-primary text-lg px-8 py-3"
          >
            Explorar Produtos
          </Link>
          <Link
            to="/register"
            className="btn-secondary text-lg px-8 py-3"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
          <div className="text-gray-600">Produtos Disponíveis</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl font-bold text-primary-600 mb-2">5000+</div>
          <div className="text-gray-600">Clientes Satisfeitos</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
          <div className="text-gray-600">Suporte ao Cliente</div>
        </div>
      </section>
    </div>
  );
};

export default Home; 