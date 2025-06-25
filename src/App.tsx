import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LicenseTable } from '@/components/licenses/LicenseTable';
import { LicenseModal } from '@/components/licenses/LicenseModal';
import { Microsoft365Dashboard } from '@/components/microsoft365/Microsoft365Dashboard';
import { LicenseProvider, useLicense } from '@/contexts/LicenseContext';
import { License } from '@/types/license';
import { mockLicenses, mockMicrosoft365Pools, mockMicrosoft365Users } from '@/data/mockData';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const categoryTitles = {
  dashboard: 'Dashboard',
  microsoft365: 'Licenças Microsoft 365',
  sophos: 'Licenças Sophos',
  server: 'Licenças de Servidores',
  windows: 'Licenças Windows',
};

function AppContent() {
  const { state, dispatch, getFilteredLicenses } = useLicense();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load mock data on first render
  useEffect(() => {
    dispatch({ type: 'LOAD_LICENSES', payload: mockLicenses });
    dispatch({ type: 'LOAD_M365_POOLS', payload: mockMicrosoft365Pools });
    dispatch({ type: 'LOAD_M365_USERS', payload: mockMicrosoft365Users });
  }, [dispatch]);

  const handleAddLicense = () => {
    setEditingLicense(null);
    setIsModalOpen(true);
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setIsModalOpen(true);
  };

  const handleDeleteLicense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença?')) {
      dispatch({ type: 'DELETE_LICENSE', payload: id });
      toast.success('Licença excluída com sucesso!');
    }
  };

  const handleSaveLicense = (licenseData: Partial<License>) => {
    if (editingLicense) {
      dispatch({ type: 'UPDATE_LICENSE', payload: licenseData as License });
      toast.success('Licença atualizada com sucesso!');
    } else {
      dispatch({ type: 'ADD_LICENSE', payload: licenseData as License });
      toast.success('Licença criada com sucesso!');
    }
  };

  const handleCategoryChange = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
    setIsMobileSidebarOpen(false);
  };

  const handleSearchChange = (term: string) => {
    dispatch({ type: 'SET_SEARCH', payload: term });
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const filteredLicenses = getFilteredLicenses();

  const renderMainContent = () => {
    switch (state.selectedCategory) {
      case 'dashboard':
        return <Dashboard />;
      case 'microsoft365':
        return <Microsoft365Dashboard />;
      default:
        return (
          <LicenseTable
            licenses={filteredLicenses}
            onEdit={handleEditLicense}
            onDelete={handleDeleteLicense}
            title={categoryTitles[state.selectedCategory as keyof typeof categoryTitles]}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileSidebar} />
      )}

      {/* Sidebar */}
      <div className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-50 transition-transform duration-300 md:block`}>
        <Sidebar
          selectedCategory={state.selectedCategory}
          onCategoryChange={handleCategoryChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchTerm={state.searchTerm}
          onSearchChange={handleSearchChange}
          onAddLicense={handleAddLicense}
          onToggleSidebar={toggleMobileSidebar}
          selectedCategory={state.selectedCategory}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderMainContent()}
        </main>
      </div>

      {/* License Modal */}
      {state.selectedCategory !== 'microsoft365' && (
        <LicenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLicense}
          license={editingLicense}
          licenseType={state.selectedCategory}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <LicenseProvider>
      <AppContent />
    </LicenseProvider>
  );
}

export default App;