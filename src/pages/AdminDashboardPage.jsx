import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import TableSortHeader from '../components/TableSortHeader';
import Modal from '../components/Modal';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building,
  Shield,
  UserCheck,
} from 'lucide-react';

const AdminDashboardPage = () => {
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    roleCounts: { ADMIN: 0, NORMAL_USER: 0, STORE_OWNER: 0 },
  });

  // Active Tab: 'stores' | 'users'
  const [activeTab, setActiveTab] = useState('stores');

  // Stores State
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');
  const [loadingStores, setLoadingStores] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Add Store Form
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  // Add User Form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER',
  });

  // Form feedback
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const query = new URLSearchParams({
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      });
      const data = await api.get(`/admin/stores?${query.toString()}`);
      setStores(data.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const query = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      const data = await api.get(`/admin/users?${query.toString()}`);
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    } else {
      fetchUsers();
    }
  }, [activeTab, storeSearch, storeSortBy, storeSortOrder, userSearch, userRoleFilter, userSortBy, userSortOrder]);

  // Handle Add Store
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/stores', {
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim(),
        ownerId: newStore.ownerId || undefined,
      });
      setFormSuccess('Store created successfully!');
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      setTimeout(() => {
        setIsAddStoreOpen(false);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Failed to create store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/users', {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        address: newUser.address.trim(),
        role: newUser.role,
      });
      setFormSuccess('User account created successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
      setTimeout(() => {
        setIsAddUserOpen(false);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open User Details
  const handleViewUserDetails = async (userId) => {
    try {
      const data = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetails(data.user);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            System Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Store Owner
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Administrator Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Manage system stores, user accounts, and monitor overall platform ratings
        </p>
      </div>

      {/* Metric Cards (Total Users, Total Stores, Total Ratings) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
          subtitle={`Admins: ${stats.roleCounts?.ADMIN || 0} • Owners: ${stats.roleCounts?.STORE_OWNER || 0} • Users: ${stats.roleCounts?.NORMAL_USER || 0}`}
        />
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          color="blue"
          subtitle="Registered merchant businesses"
        />
        <StatCard
          title="Total Ratings Submitted"
          value={stats.totalRatings}
          icon={Star}
          color="amber"
          subtitle="Ratings submitted across stores"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'stores'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Stores Directory ({stats.totalStores})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({stats.totalUsers})</span>
          </button>
        </div>

        {/* Tab 1: Stores Management */}
        {activeTab === 'stores' && (
          <div className="p-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter stores by Name, Email, Address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  setFormError('');
                  setFormSuccess('');
                  setIsAddStoreOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store</span>
              </button>
            </div>

            {/* Stores Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableSortHeader
                      label="Store Name"
                      field="name"
                      currentSort={storeSortBy}
                      currentOrder={storeSortOrder}
                      onSort={(field, order) => {
                        setStoreSortBy(field);
                        setStoreSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Email"
                      field="email"
                      currentSort={storeSortBy}
                      currentOrder={storeSortOrder}
                      onSort={(field, order) => {
                        setStoreSortBy(field);
                        setStoreSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Address"
                      field="address"
                      currentSort={storeSortBy}
                      currentOrder={storeSortOrder}
                      onSort={(field, order) => {
                        setStoreSortBy(field);
                        setStoreSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Overall Rating"
                      field="rating"
                      currentSort={storeSortBy}
                      currentOrder={storeSortOrder}
                      onSort={(field, order) => {
                        setStoreSortBy(field);
                        setStoreSortOrder(order);
                      }}
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {loadingStores ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm">Loading stores...</p>
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No stores found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-900 block">{store.name}</span>
                          {store.owner && (
                            <span className="text-xs text-slate-400">
                              Owner: {store.owner.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{store.email}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 max-w-xs truncate" title={store.address}>
                          {store.address}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <StarRating rating={store.rating} readOnly size="sm" />
                            <span className="text-xs font-bold text-slate-700">
                              {store.rating > 0 ? store.rating : 'N/A'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({store.ratingCount} {store.ratingCount === 1 ? 'rating' : 'ratings'})
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Name, Email, Address..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormError('');
                  setFormSuccess('');
                  setIsAddUserOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableSortHeader
                      label="Name"
                      field="name"
                      currentSort={userSortBy}
                      currentOrder={userSortOrder}
                      onSort={(field, order) => {
                        setUserSortBy(field);
                        setUserSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Email"
                      field="email"
                      currentSort={userSortBy}
                      currentOrder={userSortOrder}
                      onSort={(field, order) => {
                        setUserSortBy(field);
                        setUserSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Address"
                      field="address"
                      currentSort={userSortBy}
                      currentOrder={userSortOrder}
                      onSort={(field, order) => {
                        setUserSortBy(field);
                        setUserSortOrder(order);
                      }}
                    />
                    <TableSortHeader
                      label="Role"
                      field="role"
                      currentSort={userSortBy}
                      currentOrder={userSortOrder}
                      onSort={(field, order) => {
                        setUserSortBy(field);
                        setUserSortOrder(order);
                      }}
                    />
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Store Rating
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm">Loading users...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No users found.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{u.name}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{u.email}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 max-w-xs truncate" title={u.address}>
                          {u.address}
                        </td>
                        <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>
                        <td className="px-4 py-3.5">
                          {u.role === 'STORE_OWNER' ? (
                            u.storeRating !== null ? (
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={u.storeRating} readOnly size="sm" />
                                <span className="text-xs font-bold text-slate-700">
                                  {u.storeRating} ★
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No ratings yet</span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleViewUserDetails(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add New Store */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Register New Store"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateStore} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              type="text"
              required
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              placeholder="e.g. Apex Electronics & Gadgets Hub"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Email
            </label>
            <input
              type="email"
              required
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              placeholder="store@example.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Address
              </label>
              <span className="text-[11px] text-slate-400">{newStore.address.length}/400</span>
            </div>
            <textarea
              required
              maxLength={400}
              rows={2}
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              placeholder="Street address, City, State"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={newStore.ownerId}
              onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">-- No Owner Assigned Yet --</option>
              {users
                .filter((u) => u.role === 'STORE_OWNER')
                .map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select an existing Store Owner user account or assign later.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Add New User */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New User Account"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  newUser.name.length >= 20 && newUser.name.length <= 60
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {newUser.name.length}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Christopher Alexander Hamilton"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="8-16 characters, 1 uppercase, 1 special (e.g. User@123#)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Must be 8-16 chars with at least one uppercase letter and one special character.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Address
              </label>
              <span className="text-[11px] text-slate-400">{newUser.address.length}/400</span>
            </div>
            <textarea
              required
              maxLength={400}
              rows={2}
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="Street address, City, State"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View User Details */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="User Account Details"
      >
        {selectedUserDetails && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {selectedUserDetails.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedUserDetails.name}</h4>
                <p className="text-xs text-slate-500">{selectedUserDetails.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
                  System Role
                </span>
                <div>{getRoleBadge(selectedUserDetails.role)}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
                  Registered Date
                </span>
                <span className="font-medium text-slate-700">
                  {new Date(selectedUserDetails.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
                Full Address
              </span>
              <p className="text-slate-700">{selectedUserDetails.address}</p>
            </div>

            {/* Assessment Specification: If user is Store Owner, their Rating should also be displayed */}
            {selectedUserDetails.role === 'STORE_OWNER' && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>Store Owner Details & Rating</span>
                </div>

                {selectedUserDetails.storeInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Store Name:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetails.storeInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Store Overall Rating:</span>
                      <div className="flex items-center gap-1.5">
                        <StarRating
                          rating={selectedUserDetails.storeRating || 0}
                          readOnly
                          size="sm"
                        />
                        <span className="font-bold text-amber-700">
                          {selectedUserDetails.storeRating > 0
                            ? `${selectedUserDetails.storeRating} ★`
                            : 'No ratings yet'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Reviews:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetails.storeInfo.totalRatings}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700">
                    This user is registered as a Store Owner, but does not have a store assigned yet.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
