import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';
import TableSortHeader from '../components/TableSortHeader';
import Modal from '../components/Modal';
import {
  Store,
  Search,
  Star,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

const UserStoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [userRatingInput, setUserRatingInput] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState('');
  const [ratingErrorMessage, setRatingErrorMessage] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
      });
      const data = await api.get(`/stores?${query.toString()}`);
      setStores(data.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setUserRatingInput(store.userRating ? store.userRating.rating : 5);
    setRatingSuccessMessage('');
    setRatingErrorMessage('');
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setIsSubmittingRating(true);
    setRatingErrorMessage('');
    setRatingSuccessMessage('');

    try {
      if (selectedStore.userRating) {
        // Modify existing rating
        await api.put(`/ratings/${selectedStore.id}`, {
          rating: userRatingInput,
        });
        setRatingSuccessMessage('Rating successfully updated!');
      } else {
        // Submit new rating
        await api.post('/ratings', {
          storeId: selectedStore.id,
          rating: userRatingInput,
        });
        setRatingSuccessMessage('Thank you! Your rating has been submitted.');
      }

      await fetchStores();

      setTimeout(() => {
        setIsRatingModalOpen(false);
        setRatingSuccessMessage('');
      }, 1000);
    } catch (err) {
      setRatingErrorMessage(err.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Explore Stores</span>
            <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {stores.length} registered
            </span>
          </h1>
          <p className="text-slate-500 mt-1">
            Browse registered stores, search by name or address, and submit your ratings (1 to 5 stars).
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Store Name or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <TableSortHeader
                  label="Store Name"
                  field="name"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <TableSortHeader
                  label="Address"
                  field="address"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <TableSortHeader
                  label="Overall Rating"
                  field="rating"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                />
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your Submitted Rating
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm">Loading registered stores...</p>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Store className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No stores match your search query.</p>
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const hasRated = !!store.userRating;

                  return (
                    <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{store.name}</span>
                            <span className="text-xs text-slate-400">{store.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 max-w-sm">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{store.address}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <StarRating rating={store.overallRating} readOnly size="sm" />
                          <span className="text-sm font-bold text-slate-800">
                            {store.overallRating > 0 ? store.overallRating : 'N/A'}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {hasRated ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-amber-800">
                              {store.userRating.rating} / 5 Stars
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated yet</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openRatingModal(store)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            hasRated
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          }`}
                        >
                          {hasRated ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modify Rating</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-3.5 h-3.5" />
                              <span>Rate Store</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Optimized for Phones & Small Screens) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No stores match your search.</p>
          </div>
        ) : (
          stores.map((store) => {
            const hasRated = !!store.userRating;

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{store.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                      Overall Rating
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={store.overallRating} readOnly size="sm" />
                      <span className="text-xs font-bold text-slate-800">
                        {store.overallRating > 0 ? store.overallRating : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase text-right">
                      Your Rating
                    </span>
                    <div className="mt-0.5">
                      {hasRated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {store.userRating.rating}/5
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not rated</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openRatingModal(store)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    hasRated
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {hasRated ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Your Rating</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate This Store</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Submit / Modify Rating */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={selectedStore?.userRating ? 'Modify Your Rating' : 'Submit Store Rating'}
      >
        {selectedStore && (
          <form onSubmit={handleRatingSubmit} className="space-y-5">
            {ratingErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ratingErrorMessage}</span>
              </div>
            )}
            {ratingSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{ratingSuccessMessage}</span>
              </div>
            )}

            {/* Store Preview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">{selectedStore.name}</h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedStore.address}</span>
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span>Current Store Average:</span>
                <span className="font-bold text-slate-800">
                  {selectedStore.overallRating > 0 ? `${selectedStore.overallRating} ★` : 'No reviews'}
                </span>
              </div>
            </div>

            {/* Interactive Rating Picker */}
            <div className="text-center py-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Select Your Rating (1 to 5 Stars)
              </label>

              <div className="flex justify-center">
                <StarRating
                  rating={userRatingInput}
                  onRatingChange={(newVal) => setUserRatingInput(newVal)}
                  size="xl"
                />
              </div>

              <p className="text-xs text-amber-700 font-semibold mt-3">
                Click a star to choose your rating: {userRatingInput} of 5
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingRating}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingRating ? (
                  'Saving...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {selectedStore.userRating ? 'Update My Rating' : 'Submit Rating'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserStoreListPage;
