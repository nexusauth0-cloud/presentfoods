import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/layout/PublicLayout';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import FeaturedMeals from '../components/landing/FeaturedMeals';
import HowItWorks from '../components/landing/HowItWorks';

export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return (
    <PublicLayout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedMeals />
      <HowItWorks />
    </PublicLayout>
  );
}
