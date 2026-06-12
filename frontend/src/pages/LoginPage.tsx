import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiShield } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, signup, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
    try {
      if (mode === 'login') await login(email, password);
      else await signup(name, email, password, adminCode || undefined);
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <MdRestaurant className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">Present Foods</h1>
          <p className="text-gray-500 text-sm mt-1">{mode === 'login' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="John Doe" required />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-800">{showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}</button>
            </div>
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">Admin Code <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="Enter admin code to register as admin" />
              </div>
            </div>
          )}
          {error && <div className="flex items-center gap-2 bg-red-50 text-danger text-sm p-3 rounded-xl"><FiAlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-5 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }} className="text-primary font-semibold hover:underline" type="button">Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); }} className="text-primary font-semibold hover:underline" type="button">Sign In</button></p>
          )}
          <p className="mt-2"><button onClick={() => navigate('/')} className="text-gray-400 hover:text-primary text-xs" type="button">Back to home</button></p>
        </div>
      </div>
    </div>
  );
}
