// frontend/src/pages/admin/ManageStationsPage.jsx
import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image,
  Save,
  X,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Printer,
  Copy,
  Link,
  Share2,
  Bookmark,
  Flag,
  Target,
  Award,
  Medal,
  Crown,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Shield,
  ShieldCheck,
  ShieldOff,
  Lock,
  Unlock,
  Key,
  User,
  Users,
  Calendar,
  Clock,
  Timer,
  Play,
  Pause,
  StopCircle,
  FastForward,
  Rewind,
  Maximize2,
  Minimize2,
  ExternalLink,
  Send,
  Inbox,
  MessageSquare,
  BellRing,
  CalendarDays,
  Clock as ClockIcon,
  Sparkles,
  Rocket,
} from 'lucide-react';

const ManageStationsPage = ({
  stations,
  stationForm,
  setStationForm,
  stationImage,
  setStationImage,
  editingStationId,
  stationLoading,
  stationMessage,
  handleStationSubmit,
  handleEditStation,
  handleDeleteStation,
  getStationImageUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);

  // Filter stations based on search term
  const filteredStations = stations.filter(station =>
    station.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.stationId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (station) => {
    setStationToDelete(station);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (stationToDelete) {
      handleDeleteStation(stationToDelete._id);
      setShowDeleteModal(false);
      setStationToDelete(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setStationForm({
      stationName: '',
      stationId: '',
      threshold: '1.5',
      description: ''
    });
    setStationImage(null);
    setImagePreview(null);
    setEditingStationId(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (station) => {
    handleEditStation(station);
    setShowForm(true);
    // Scroll to form
    document.getElementById('station-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Manage Stations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, edit, and manage monitoring stations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Station</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Station Form */}
      {showForm && (
        <div id="station-form" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editingStationId ? 'Edit Station' : 'Create New Station'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleStationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Station Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Station Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={stationForm.stationName}
                    onChange={(e) => setStationForm({ ...stationForm, stationName: e.target.value })}
                    placeholder="Enter station name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Station ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Station ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={stationForm.stationId}
                    onChange={(e) => setStationForm({ ...stationForm, stationId: e.target.value })}
                    placeholder="Enter station ID"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Threshold (m)
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={stationForm.threshold}
                    onChange={(e) => setStationForm({ ...stationForm, threshold: e.target.value })}
                    placeholder="Enter threshold"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Station Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        onClick={() => {
                          setStationImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={stationForm.description}
                onChange={(e) => setStationForm({ ...stationForm, description: e.target.value })}
                placeholder="Enter station description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={stationLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {stationLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingStationId ? 'Update Station' : 'Create Station'}</span>
                  </>
                )}
              </button>
              {editingStationId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            {/* Status Message */}
            {stationMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                stationMessage.includes('success') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                {stationMessage.includes('success') ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{stationMessage}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredStations.length} stations
          </span>
        </div>
      </div>

      {/* Stations Grid/List View */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No stations found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your first station
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStations.map((station) => (
            <div
              key={station._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                {station.imageUrl ? (
                  <img
                    src={getStationImageUrl(station.imageUrl)}
                    alt={station.stationName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(station)}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => confirmDelete(station)}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {station.stationName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {station.stationId}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {station.threshold}m
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStations.map((station) => (
                  <tr key={station._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {station.imageUrl ? (
                            <img
                              src={getStationImageUrl(station.imageUrl)}
                              alt={station.stationName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MapPin className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {station.stationName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {station.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {station.stationId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {station.threshold}m
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(station)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(station)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Station
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <strong>{stationToDelete?.stationName}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/25 transition-all duration-200"
                >
                  Delete Station
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStationsPage;