import { FiSearch, FiShoppingCart, FiCheckCircle, FiHeart } from 'react-icons/fi';

const steps = [
  { icon: <FiSearch className="w-6 h-6" />, title: 'Browse Menu', desc: 'Explore our wide selection of Nigerian dishes' },
  { icon: <FiShoppingCart className="w-6 h-6" />, title: 'Place Order', desc: 'Add to cart and checkout with delivery details' },
  { icon: <FiCheckCircle className="w-6 h-6" />, title: 'We Prepare', desc: 'Freshly prepared with authentic Nigerian recipes' },
  { icon: <FiHeart className="w-6 h-6" />, title: 'Enjoy Delivered', desc: 'Hot and fresh meals delivered to your doorstep' },
];

export default function HowItWorks() {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800">How It Works</h2>
          <p className="text-gray-500 mt-2 text-sm">Getting your favorite meals is easy</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-warm rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">{step.icon}</div>
              <h3 className="font-semibold text-neutral-800 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
