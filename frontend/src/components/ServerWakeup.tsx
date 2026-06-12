import { useState, useEffect, ReactNode } from 'react';
import { MdRestaurant } from 'react-icons/md';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function ServerWakeup({ children }: { children: ReactNode }) {
  const [awake, setAwake] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => setShowMessage(true), 2000);

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then(() => {
        clearTimeout(timeout);
        setAwake(true);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        clearTimeout(timeout);
        setAwake(true);
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  if (awake) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-900 flex flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-6">
        <MdRestaurant className="w-8 h-8 text-amber-400" />
        <span className="text-2xl font-bold text-white">Present Foods</span>
      </div>
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-amber-400 rounded-full animate-spin" />
      </div>
      {showMessage && (
        <p className="text-gray-400 text-sm animate-pulse">
          Waking up the server, please hang tight...
        </p>
      )}
    </div>
  );
}
