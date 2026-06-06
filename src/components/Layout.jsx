import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Collapsible navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Global utilities & profile */}
        <Header />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
