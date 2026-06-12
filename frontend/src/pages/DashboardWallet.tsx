import { useState, useEffect } from 'react';
import { FiDollarSign, FiArrowUp, FiClock } from 'react-icons/fi';
import { api } from '../api/client';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxx';

export default function DashboardWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.wallet.get().then(data => {
      setBalance(data.balance);
      setTransactions(data.transactions);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 100) return;
    setProcessing(true);

    api.wallet.initialize(amount).then(data => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        reference: data.reference,
        callback: () => {
          api.wallet.verify(data.reference).then(res => {
            setBalance(res.balance);
            setTopUpAmount('');
            return api.wallet.get();
          }).then(res => {
            setBalance(res.balance);
            setTransactions(res.transactions);
          }).catch(() => {});
        },
        onClose: () => {},
      });
      handler.openIframe();
    }).catch(() => {}).finally(() => setProcessing(false));
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Wallet</h1>

      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
        <p className="text-orange-100 text-sm font-medium">Available Balance</p>
        <p className="text-3xl lg:text-4xl font-bold mt-1">₦{balance.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">Top Up Wallet</h2>
        <div className="flex gap-3">
          <input
            type="number"
            value={topUpAmount}
            onChange={e => setTopUpAmount(e.target.value)}
            placeholder="Enter amount (₦100 min)"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleTopUp}
            disabled={processing || !topUpAmount || parseInt(topUpAmount) < 100}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-60 text-sm whitespace-nowrap"
          >
            {processing ? 'Processing...' : 'Fund Wallet'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <FiClock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <FiArrowUp className={`w-4 h-4 ${tx.type === 'debit' ? 'rotate-180' : ''}`} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 capitalize">{tx.description.replace('paystack:', 'Wallet Top Up - ')}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
