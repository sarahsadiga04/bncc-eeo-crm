/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useEffect, useState} from 'react';
import {Footer} from './components/Footer';
import {HeroSection} from './components/HeroSection';
import {LoginSection} from './components/LoginSection';
import {WorkspaceApp} from './components/workspace/WorkspaceApp';
import {
  clearSessionUser,
  clearWorkspaceCache,
  loadDatabaseSnapshot,
  loadSeedWorkspaceFromJson,
  loadSessionUser,
  saveSessionUser,
  saveWorkspaceCache,
  type PrototypeDatabaseSnapshot,
} from './services/jsonDb';
import type {PrototypeWorkspaceData, UserAccount, UserRole} from './types/database';

export default function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadSessionUser());
  const [dbSnapshot, setDbSnapshot] = useState<PrototypeDatabaseSnapshot | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    let active = true;

    loadDatabaseSnapshot()
      .then((snapshot) => {
        if (!active) return;
        setDbSnapshot(snapshot);
        setDbError(null);

        // Optional ?autostart=1 support for direct workspace testing
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1' && !loadSessionUser()) {
          const targetRole: UserRole = params.get('role') === 'member' ? 'member' : 'admin';
          const autoUser = snapshot.users.find((u) => u.role === targetRole);
          if (autoUser) {
            setCurrentUser(autoUser);
            setSelectedRole(autoUser.role);
            saveSessionUser(autoUser);
          }
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : 'Gagal memuat database JSON prototype.';
        setDbError(message);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingDb(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const scrollToElement = (elementId: string) => {
    const target = document.getElementById(elementId);
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setSelectedRole(user.role);
    saveSessionUser(user);
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  };

  const handleLogout = () => {
    clearSessionUser();
    setCurrentUser(null);
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  };

  const handleUpdateWorkspace = (next: PrototypeWorkspaceData) => {
    setDbSnapshot(next);
    saveWorkspaceCache(next);
  };

  const handleResetDemoData = () => {
    clearWorkspaceCache();
    setIsLoadingDb(true);
    loadSeedWorkspaceFromJson()
      .then((seed) => {
        setDbSnapshot(seed);
        setDbError(null);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Gagal mereset database JSON prototype.';
        setDbError(message);
      })
      .finally(() => {
        setIsLoadingDb(false);
      });
  };

  if (currentUser && dbSnapshot) {
    return (
      <WorkspaceApp
        user={currentUser}
        workspace={dbSnapshot}
        onUpdateWorkspace={handleUpdateWorkspace}
        onResetDemoData={handleResetDemoData}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E]">
      <main className="flex-1">
        <HeroSection
          onScrollToLogin={() => scrollToElement('login-section')}
          onScrollToFeatures={() => scrollToElement('fitur-utama')}
          isAuthenticated={currentUser !== null}
        />

        <LoginSection
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          currentUser={currentUser}
          dbSnapshot={dbSnapshot}
          dbError={dbError}
          isLoadingDb={isLoadingDb}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      </main>

      <Footer />
    </div>
  );
}
