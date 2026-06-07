import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground print:h-auto print:w-auto print:bg-white print:text-black print:block">
      {/* Sidebar - Collapsible navigation */}
      <div className="print:hidden flex shrink-0">
        <Sidebar />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Header - Global utilities & profile */}
        <div className="print:hidden">
          <Header />
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar print:p-0 print:overflow-visible print:h-auto print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
