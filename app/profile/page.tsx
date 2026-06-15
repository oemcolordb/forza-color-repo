'use client'



import { useState, useEffect } from 'react';
import ClientOnly from '@/components/system/ClientOnly';
import { logger } from '@/lib/utils/logger';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import GamingErrorBoundary from '@/components/error/GamingErrorBoundary';

function ProfileContent() {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';
        const response = await fetch(`/api/favorites?sessionId=${sessionId}&userId=${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        logger.error('Failed to fetch favorites', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const removeFavorite = async (colorId: string) => {
    try {
      const sessionId = localStorage.getItem('forza-session-id') || 'anonymous';
      const response = await fetch(`/api/favorites?sessionId=${sessionId}&colorId=${colorId}&userId=${user?.id || ''}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter(f => f.colorId !== colorId));
      }
    } catch (err) {
      logger.error('Failed to remove favorite:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      return setPasswordError('New passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setPasswordError('New password must be at least 8 characters.');
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <GamingErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Your Profile
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                Manage your account settings and view your saved colors.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Left Column: Account Info */}
              <div className="col-span-1 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-inner">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <button
                      onClick={logout}
                      className="w-full rounded-xl px-4 py-2 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>

                {/* Change Password Block */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {passwordError && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-200">
                        {passwordSuccess}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:hover:bg-blue-500"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Favorites Summary */}
              <div className="col-span-1 md:col-span-2">
                <div className="min-h-[400px] rounded-2xl border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                      ❤️ <span>Saved Favorites</span>
                    </h3>
                    <Link href="/favorites" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">View All →</Link>
                  </div>

                  {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {favorites.slice(0, 6).map((fav, idx) => (
                        <div key={idx} className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-500 dark:border-gray-700 dark:bg-gray-900/50">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className="h-10 w-10 shrink-0 rounded-full border border-gray-300 dark:border-gray-600"
                              style={{
                                background: `linear-gradient(135deg, hsl(${fav.color1.h * 360}, ${fav.color1.s * 100}%, ${fav.color1.b * 100}%), hsl(${(fav.color2?.h || fav.color1.h) * 360}, ${(fav.color2?.s || fav.color1.s) * 100}%, ${(fav.color2?.b || fav.color1.b) * 100}%))`,
                              }}
                            />
                            <div className="overflow-hidden pr-4">
                              <div className="truncate text-sm font-bold text-gray-900 dark:text-white">{fav.colorName}</div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">{fav.make} {fav.model}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFavorite(fav.colorId)}
                            className="shrink-0 p-2 text-red-500 transition-transform hover:scale-110"
                            title="Remove from favorites"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center dark:border-gray-700 dark:bg-gray-900/30">
                      <div className="text-5xl opacity-80">🎨</div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">No saved colors yet</p>
                        <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
                          Browse the database and click the heart icon to save your favorite paints.
                        </p>
                      </div>
                      <Link href="/" className="mt-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                        Browse Colors
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GamingErrorBoundary>
    </ProtectedRoute>
  );
}





export default function ProfilePage() {
  return (
    <GamingErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          <ClientOnly>
        <ProfileContent />
      </ClientOnly>
        </ProtectedRoute>
      </AuthProvider>
    </GamingErrorBoundary>
  );
}
