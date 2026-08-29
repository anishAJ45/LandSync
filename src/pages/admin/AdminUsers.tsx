import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Check, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DataTable, Column } from '../../components/common/DataTable';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<User[]>('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/api/users/${user.id}`, {
        is_active: !user.is_active,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  if (loading) return <LoadingSpinner message="Fetching user directory..." size="lg" />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  const columns: Column<User>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-700">#{row.id}</span>,
    },
    {
      header: 'Full Name',
      accessorKey: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-950 text-teal-300 text-xs font-bold flex items-center justify-center">
            {row.full_name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-900">{row.full_name}</span>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.email}</span>,
    },
    {
      header: 'Role',
      accessorKey: 'role',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
            row.role === 'admin'
              ? 'bg-amber-100 text-amber-900'
              : row.role === 'officer'
              ? 'bg-blue-100 text-blue-900'
              : 'bg-teal-100 text-teal-900'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            row.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {row.is_active ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className="text-xs font-semibold text-slate-600 hover:text-blue-950 underline"
        >
          {row.is_active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div id="admin-users-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">User Directory & Role Governance</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage authenticated accounts, administrative role permissions, and active status.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh Users
        </button>
      </div>

      <DataTable id="admin-users-table" columns={columns} data={users} />
    </div>
  );
};
