import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { RequisitionsPage } from './RequisitionsPage';
import { AssetsPage } from './AssetsPage';
import { DepartmentsPage } from './DepartmentsPage';
import { UsersPage } from './UsersPage';
import { CreateRequestModal } from '../components/modals/CreateRequestModal';
import { RequestDetailModal } from '../components/modals/RequestDetailModal';
import { UserModal } from '../components/modals/UserModal';
import { DepartmentModal } from '../components/modals/DepartmentModal';
import { AssetModal } from '../components/modals/AssetModal';
import { EmailLogsModal } from '../components/modals/EmailLogsModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requisitions');
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const isMasterAdmin = user?.role_name === 'Master Admin';

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Dynamic Floating Action Button (+): Contextual based on role and tab
  const handleFabClick = () => {
    switch (activeTab) {
      case 'departments':
        setSelectedDept(null);
        setIsDeptModalOpen(true);
        break;
      case 'assets':
        setSelectedAsset(null);
        setIsAssetModalOpen(true);
        break;
      case 'users':
        setIsUserModalOpen(true);
        break;
      case 'requisitions':
      default:
        setIsCreateReqOpen(true);
        break;
    }
  };

  const getFabTitle = () => {
    switch (activeTab) {
      case 'departments': return 'Tambah Divisi Baru';
      case 'assets': return 'Tambah Barang Inventaris Baru';
      case 'users': return 'Registrasi Akun Baru';
      case 'requisitions':
      default: return 'Buat Laporan Perbaikan Baru';
    }
  };

  // Determine whether to display the FAB button
  const shouldShowFab = () => {
    if (activeTab === 'email-logs') return false;
    return true;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'requisitions':
        return (
          <RequisitionsPage
            key={refreshKey}
            search={search}
            onSelectRequisition={(id) => setSelectedReqId(id)}
          />
        );
      case 'assets':
        return (
          <AssetsPage
            key={refreshKey}
            search={search}
            onOpenAssetModal={(asset) => {
              setSelectedAsset(asset);
              setIsAssetModalOpen(true);
            }}
          />
        );
      case 'departments':
        return (
          <DepartmentsPage
            key={refreshKey}
            onOpenDeptModal={(dept) => {
              setSelectedDept(dept);
              setIsDeptModalOpen(true);
            }}
          />
        );
      case 'users':
        return (
          <UsersPage
            key={refreshKey}
            onOpenUserModal={() => setIsUserModalOpen(true)}
          />
        );
      case 'email-logs':
        return <EmailLogsModal isOpen={true} onClose={() => setActiveTab('requisitions')} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header search={search} setSearch={setSearch} />

      <main className="main-layout">
        {renderContent()}

        {/* Floating Action Button (+) strictly for Supervisors on Requisitions, or Master Admin on Management tabs */}
        {shouldShowFab() && (
          <FloatingActionButton onClick={handleFabClick} title={getFabTitle()} />
        )}

        {/* Pop Up Modals */}
        <CreateRequestModal
          isOpen={isCreateReqOpen}
          onClose={() => setIsCreateReqOpen(false)}
          onSuccess={handleRefresh}
        />

        <RequestDetailModal
          requisitionId={selectedReqId}
          isOpen={!!selectedReqId}
          isMasterAdmin={isMasterAdmin}
          onClose={() => setSelectedReqId(null)}
          onStatusUpdated={handleRefresh}
        />

        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSuccess={handleRefresh}
        />

        <DepartmentModal
          isOpen={isDeptModalOpen}
          departmentData={selectedDept}
          onClose={() => {
            setIsDeptModalOpen(false);
            setSelectedDept(null);
          }}
          onSuccess={handleRefresh}
        />

        <AssetModal
          isOpen={isAssetModalOpen}
          assetData={selectedAsset}
          onClose={() => {
            setIsAssetModalOpen(false);
            setSelectedAsset(null);
          }}
          onSuccess={handleRefresh}
        />
      </main>
    </div>
  );
};
