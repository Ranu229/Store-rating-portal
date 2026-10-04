import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import TableSortHeader from '../components/TableSortHeader';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  Calendar,
  Award,
  AlertCircle,
} from 'lucide-react';

const StoreOwnerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        sortBy,
        sortOrder,
      });
      const data = await api.get(`/owner/dashboard?${query.toString()}`);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading store dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!dashboardData?.hasStore) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Store Assigned Yet</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Your account is registered as a Store Owner, but an administrator has not linked a store to your profile yet. Please contact your system administrator.
        </p>
      </div>
    );
  }

  const { store, averageRating, totalRatings, starCounts, userRatings } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-white/20 text-blue-100 uppercase tracking-wider">
                Store Owner Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {store.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-200" /> {store.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-200" /> {store.address}
                </span>
              </div>
            </div>
          </div>

          {/* Average Rating Badge in Header */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div>
              <span className="text-xs text-blue-100 font-medium block">Average Store Rating</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white">
                  {averageRating > 0 ? averageRating : '0.0'}
                </span>
                <span className="text-sm text-blue-200 font-semibold">/ 5.0</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Rating Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Overall Store Rating"
          value={averageRating > 0 ? `${averageRating} ★` : 'No ratings'}
          icon={Award}
          color="amber"
          subtitle="Calculated average across all submitted user ratings"
        />

        <StatCard
          title="Total User Ratings"
          value={totalRatings}
          icon={Users}
          color="blue"
          subtitle="Customers who submitted a rating"
        />

        {/* Rating Breakdown / Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-bold text-slate-800 mb-3">Rating Breakdown</p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars] || 0;
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-slate-600 flex items-center gap-0.5">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-400 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ratings Table: Users who rated the store */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Users Who Have Submitted Ratings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified customer ratings for {store.name}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full self-start sm:self-auto">
            {userRatings.length} submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableSortHeader
                  label="Customer Name"
                  field="userName"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <TableSortHeader
                  label="Customer Email"
                  field="userEmail"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </th>
                <TableSortHeader
                  label="Rating Submitted"
                  field="rating"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <TableSortHeader
                  label="Date Submitted"
                  field="createdAt"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {userRatings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No users have rated your store yet.</p>
                  </td>
                </tr>
              ) : (
                userRatings.map((item) => (
                  <tr key={item.ratingId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {item.user.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {item.user.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.user.address}>
                      {item.user.address}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={item.rating} readOnly size="sm" />
                        <span className="text-xs font-bold text-slate-800">
                          {item.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboardPage;
