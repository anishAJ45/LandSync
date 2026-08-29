import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  Search,
  Filter,
  Activity,
  Key
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import { UserRoleAssignment, RolePermissionDefinition, ExtendedUserRole } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdminUsersRoles: React.FC = () => {
  const [users, setUsers] = useState<UserRoleAssignment[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'activity'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Role Edit Modal state
  const [editingUser, setEditingUser] = useState<UserRoleAssignment | null>(null);
  const [selectedRole, setSelectedRole] = useState<ExtendedUserRole>('citizen');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uList, permMatrix] = await Promise.all([
        advancedGovernanceService.getUserRoleAssignments(),
        advancedGovernanceService.getRolePermissionMatrix()
      ]);
      setUsers(uList);
      setMatrix(permMatrix);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load user and role directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (user: UserRoleAssignment) => {
    try {
      const updated = await advancedGovernanceService.updateUserRole(user.user_id, user.role, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.user_id === user.user_id ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle user status');
    }
  };

  const handleSaveRoleChange = async () => {
    if (!editingUser) return;
    try {
      setUpdating(true);
      const updated = await advancedGovernanceService.updateUserRole(editingUser.user_id, selectedRole, editingUser.is_active);
      setUsers((prev) => prev.map((u) => (u.user_id === editingUser.user_id ? updated : u)));
      setEditingUser(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner message="Loading RBAC & User Directory..." size="lg" />;
  if (error) return <ErrorMessage title="User & Role Error" message={error} onRetry={loadData} />;

  return (
    <div id="admin-users-roles" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User & Role Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              5-Tier RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure access permissions for Citizen, Land Officer, System Admin, and State Revenue Administrator accounts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>RBAC Permission Matrix</span>
        </button>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white font-semibold text-slate-700"
              >
                <option value="ALL">All Roles</option>
                <option value="citizen">Citizen</option>
                <option value="officer">Officer (Tahsildar / VAO)</option>
                <option value="admin">Administrator</option>
                <option value="system_admin">System Admin</option>
                <option value="state_admin">State Admin</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-950 text-teal-300 font-bold flex items-center justify-center text-xs">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.full_name}</p>
                            <p className="text-[11px] font-mono text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'system_admin'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : u.role === 'state_admin'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : u.role === 'admin'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : u.role === 'officer'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.state_jurisdiction || 'National (All States)'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.last_login).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedRole(u.role);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-900 hover:bg-blue-50 border border-blue-200 transition"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                            u.is_active
                              ? 'text-rose-700 hover:bg-rose-50 border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Permission Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matrix.map((rDef) => (
                <div key={rDef.role} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Role Key: {rDef.role}</span>
                    <h4 className="font-black text-base text-slate-900 mt-0.5">{rDef.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{rDef.description}</p>
                  </div>

                  <div className="space-y-2 pt-1">
                    {rDef.permissions.map((perm) => (
                      <div key={perm.code} className="flex items-start gap-2 text-xs">
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            perm.granted ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <div>
                          <p className={`font-semibold ${perm.granted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {perm.label}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">{perm.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Assign Role & Permissions</h3>
            <p className="text-xs text-slate-600">
              Modifying role for <span className="font-bold text-slate-900">{editingUser.full_name}</span> ({editingUser.email})
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Role Tier</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ExtendedUserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="citizen">Citizen (Land Owner / Public)</option>
                <option value="officer">Officer (Tahsildar / Surveyor / VAO)</option>
                <option value="admin">Chief Land Records Admin</option>
                <option value="system_admin">System & Infrastructure Administrator</option>
                <option value="state_admin">State Revenue Nodal Administrator</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleChange}
                disabled={updating}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
