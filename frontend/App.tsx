import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { ApplicationDetail } from './components/ApplicationDetail';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewApplication = (id: string) => {
    setSelectedApplicationId(id);
    setCurrentView('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedApplicationId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 pt-16">
        <main className="p-4 md:p-6 lg:p-8">
          {currentView === 'dashboard' ? (
            <Dashboard onViewApplication={handleViewApplication} />
          ) : (
            <ApplicationDetail 
              applicationId={selectedApplicationId!} 
              onBack={handleBackToDashboard}
            />
          )}
        </main>
      </div>
    </div>
  );
}
