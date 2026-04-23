/**
 * @file Layout.jsx
 * @description Authenticated page shell.
 *
 * Renders the fixed sidebar, the top navigation bar, and a scrollable main
 * content area. The React Router <Outlet> fills the main area with the
 * currently active feature page.
 *
 * On mobile (< md breakpoint) the sidebar is a slide-in drawer controlled
 * by `sidebarOpen` state. The backdrop overlay closes it on outside tap.
 */
import { useState } from "react";
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 p-4 md:p-5 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
