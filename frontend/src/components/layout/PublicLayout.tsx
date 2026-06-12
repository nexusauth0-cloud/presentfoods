import { ReactNode } from 'react';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import PermissionPrompt from '../PermissionPrompt';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PermissionPrompt />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
