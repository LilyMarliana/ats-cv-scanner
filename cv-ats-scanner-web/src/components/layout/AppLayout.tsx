import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar />

      <main className="ml-60 min-h-screen px-8 py-7">
        <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1400px] flex-col">
          <div className="flex-1 animate-fade-up">
            <Outlet />
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}