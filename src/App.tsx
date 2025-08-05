import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LicenseTable } from '@/components/licenses/LicenseTable';
import { LicenseModal } from '@/components/licenses/LicenseModal';
import { Microsoft365Dashboard } from '@/components/microsoft365/Microsoft365Dashboard';
import { GenericLicenseDashboard } from '@/components/licenses/GenericLicenseDashboard';
import { LicenseProvider, useLicense } from '@/contexts/LicenseContext';
import { License } from '@/types/license';
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
  const { state: authState } = useAuth();
  const { 
    state, 
    dispatch, 
    getFilteredLicenses, 
    saveLicense, 
    deleteLicense 
  } = useLicense();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Show login page if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  // Show admin panel if requested
  if (showAdminPanel) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileSidebar} />
        )}

        {/* Sidebar */}
        <div className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-50 transition-transform duration-300 md:block`}>
          <Sidebar
            selectedCategory="admin"
            onCategoryChange={(category) => {
              if (category !== 'admin') {
                setShowAdminPanel(false);
                handleCategoryChange(category);
              }
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            onShowAdminPanel={handleShowAdminPanel}
            onShowAdminPanel={() => setShowAdminPanel(true)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            searchTerm=""
            onSearchChange={() => {}}
            onAddLicense={() => {}}
            onToggleSidebar={toggleMobileSidebar}
            selectedCategory="admin"
            onShowAdminPanel={handleShowAdminPanel}
            onShowAdminPanel={() => setShowAdminPanel(true)}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <AdminPanel />
          </main>
        </div>

        <Toaster position="top-right" />
      </div>
    );
  }

  const handleAddLicense = () => {
    setEditingLicense(null);
    setIsModalOpen(true);
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setIsModalOpen(true);
  };

  const handleDeleteLicense = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença?')) {
      try {
        await deleteLicense(id);
        toast.success('Licença excluída com sucesso!');
      } catch (error) {
        // Error is already handled in the service
      }
    }
  };

  const handleSaveLicense = async (licenseData: Partial<License>) => {
    try {
      await saveLicense(licenseData);
      if (editingLicense) {
        toast.success('Licença atualizada com sucesso!');
      } else {
        toast.success('Licença criada com sucesso!');
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in the service
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

  const handleShowAdminPanel = () => {
    setShowAdminPanel(true);
  };

  const filteredLicenses = getFilteredLicenses();

  const renderMainContent = () => {
    if (state.loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{state.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    switch (state.selectedCategory) {
      case 'dashboard':
        return <Dashboard />;
      case 'microsoft365':
        return <Microsoft365Dashboard />;
      case 'sophos':
        return <GenericLicenseDashboard licenseType="sophos" title="Licenças Sophos" />;
      case 'server':
        return <GenericLicenseDashboard licenseType="server" title="Licenças de Servidores" />;
      case 'windows':
        return <GenericLicenseDashboard licenseType="windows" title="Licenças Windows" />;
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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
      {!['microsoft365', 'sophos', 'server', 'windows'].includes(state.selectedCategory) && (
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
    <AuthProvider>
      <LicenseProvider>
        <AppContent />
      </LicenseProvider>
    </AuthProvider>
  );
}

export default App;