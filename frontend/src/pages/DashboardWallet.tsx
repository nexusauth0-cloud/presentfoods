import { FiDollarSign } from 'react-icons/fi';

export default function DashboardWallet() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Wallet</h1>
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
        <p className="text-orange-100 text-sm font-medium">Available Balance</p>
        <p className="text-3xl lg:text-4xl font-bold mt-1">₦0</p>
      </div>
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm text-center">
        <div className="py-8 sm:py-12">
          <FiDollarSign className="w-14 h-14 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-semibold text-lg">Coming Soon</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
            Online payments and wallet top-up are on their way. You can place orders and pay on delivery for now.
          </p>
        </div>
      </div>
    </div>
  );
}
