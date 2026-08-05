// AdminDashboard.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, LayoutDashboard, Image as ImageIcon, Layers, X, AlertCircle, Sparkles,
  Eye, Users, MousePointer, UserCheck, Activity, BarChart2, Mail, ChevronRight, Search, ExternalLink,
  Clock, MessageCircle, Send, ShoppingCart, Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const selectedFileRef = useRef(null);

  // Tab & Analytics states
  const [activeTab, setActiveTab] = useState('artworks'); // 'artworks', 'analytics', 'users', 'custom_requests'
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [timeRange, setTimeRange] = useState('7'); // '7', '15', '30', '90', '365', '730', 'all'
  const [actionFilter, setActionFilter] = useState('all'); // 'all', 'login', 'register', 'custom_request', 'visit', 'click'
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [customRequests, setCustomRequests] = useState([]);
  const [customRequestsLoading, setCustomRequestsLoading] = useState(false);
  const [selectedUserInsight, setSelectedUserInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('A4');
  const [sizeType, setSizeType] = useState('A4');
  const [medium, setMedium] = useState('');
  const [mediumType, setMediumType] = useState('');
  const [artist, setArtist] = useState('Mahesh Wagh');
  const [images, setImages] = useState([]);
  const [isDigitalDownload, setIsDigitalDownload] = useState(false);

  const syncSizeStates = (loadedSize) => {
    const s = loadedSize || '';
    if (s === 'A3' || s === 'A4' || s === 'A5') {
      setSizeType(s);
      setSize(s);
    } else if (s === '') {
      setSizeType('A4');
      setSize('A4');
    } else {
      setSizeType('Custom');
      setSize(s);
    }
  };

  const syncMediumStates = (loadedMedium) => {
    const m = loadedMedium || '';
    if (m === 'Graphite' || m === 'Charcoal' || m === 'Both' || m === 'Graphite & Charcoal' || m === 'Pen Art') {
      setMediumType(m);
      setMedium(m);
    } else if (m === '') {
      setMediumType('');
      setMedium('');
    } else {
      setMediumType('Custom');
      setMedium(m);
    }
  };

  // Resolve backend base URL once
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    } else {
      fetchSketches();
    }
  }, [userInfo, navigate]);

  // Load data depending on activeTab or timeRange
  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      if (activeTab === 'analytics') {
        fetchStats(timeRange);
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'custom_requests') {
        fetchCustomRequests();
      }
    }
  }, [userInfo, activeTab, timeRange]);

  const fetchSketches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sketches`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSketches(data);
      } else {
        setSketches([]);
        setError(data.message || 'Failed to load collection');
      }
    } catch (err) {
      console.error('Failed to fetch sketches:', err);
      setError('Failed to load collection');
      setSketches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (daysVal) => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats?days=${daysVal || '7'}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tracking statistics');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setStatsError(err.message || 'Failed to load analytics data');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCustomRequests = async () => {
    setCustomRequestsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/custom-requests`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCustomRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch custom requests:', err);
    } finally {
      setCustomRequestsLoading(false);
    }
  };

  const fetchUserInsight = async (userId) => {
    setInsightLoading(true);
    setSelectedUserInsight(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/insight`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUserInsight(data);
      }
    } catch (err) {
      console.error('Failed to fetch user insight:', err);
    } finally {
      setInsightLoading(false);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store file reference for AI generation
    selectedFileRef.current = file;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed');

      setImages((prev) => [...prev, data.image]);
      setMessage('Image added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── AI Generation ─────────────────────────────────────────────────────────
  const handleGeminiAI = async () => {
    // Must have a locally selected file — can't re-fetch already-uploaded URLs
    if (!selectedFileRef.current) {
      setError('Please select an image file first using the upload button.');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFileRef.current);

      if (keywords.trim()) {
        formData.append('keywords', keywords.trim());
      }

      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: 'POST',
        headers: {
          // ✅ Do NOT set Content-Type — browser sets it automatically with boundary for FormData
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      if (data.title) setTitle(data.title);
      if (data.shortDescription) setTagline(data.shortDescription);
      if (data.fullDescription) setDescription(data.fullDescription);

      setMessage('✨ AI auto-fill complete!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setPrice('');
    setCategory('');
    setTagline('');
    setDescription('');
    setSize('A4');
    setSizeType('A4');
    setMedium('');
    setMediumType('');
    setArtist('Mahesh Wagh');
    setImages([]);
    setImagePreview('');
    setKeywords('');
    setError('');
    setIsDigitalDownload(false);
    selectedFileRef.current = null;
  };

  const editHandler = async (sketch) => {
    // Populate instantly from local list data
    setEditId(sketch._id);
    setTitle(sketch.title || '');
    setPrice(sketch.price || '');
    setCategory(sketch.category || '');
    setTagline(sketch.tagline || '');
    setDescription(sketch.description || '');
    syncSizeStates(sketch.size);
    syncMediumStates(sketch.medium);
    setKeywords(sketch.keywords || '');
    setArtist(sketch.artist || '');
    setImages(sketch.images || []);
    setIsDigitalDownload(sketch.isDigitalDownload || false);
    selectedFileRef.current = null; // Clear file ref on edit
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Instantly background-fetch 100% complete and fresh MongoDB document to populate descriptions, medium, size etc.
    try {
      const res = await fetch(`${API_BASE}/api/sketches/${sketch._id}`);
      if (res.ok) {
        const freshSketch = await res.json();
        setTitle(freshSketch.title || '');
        setPrice(freshSketch.price || '');
        setCategory(freshSketch.category || '');
        setTagline(freshSketch.tagline || '');
        setDescription(freshSketch.description || '');
        syncSizeStates(freshSketch.size);
        syncMediumStates(freshSketch.medium);
        setKeywords(freshSketch.keywords || '');
        setArtist(freshSketch.artist || '');
        setImages(freshSketch.images || []);
        setIsDigitalDownload(freshSketch.isDigitalDownload || false);
      }
    } catch (err) {
      console.error('Failed to background fetch fresh sketch details:', err);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // If the removed image was the one referenced for AI, clear it
    if (images.length === 1) {
      selectedFileRef.current = null;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    const sketchData = {
      title: title.trim(),
      price: Number(price),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      size,
      medium,
      artist: artist.trim() || 'Mahesh Wagh',
      images,
      isDigitalDownload,
      keywords: keywords.trim(),
    };

    try {
      const url = editId
        ? `${API_BASE}/api/sketches/${editId}`
        : `${API_BASE}/api/sketches`;

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(sketchData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save sketch');

      setMessage(editId ? 'Artwork updated successfully!' : 'Artwork published successfully!');
      resetForm();
      fetchSketches();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('⚠️ Delete this artwork permanently from collection?')) {
      try {
        const res = await fetch(`${API_BASE}/api/sketches/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        if (res.ok) {
          setMessage('Artwork removed successfully');
          fetchSketches();
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) {
        console.error('Delete failed:', err);
        setError('Failed to delete artwork');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="gallery-badge">Studio Overview</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '1rem 0' }}>
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {sketches.length} originals under one roof. Let nothing slip through.
          </p>
          <div style={{ width: '80px', height: '3px', background: 'var(--primary-gradient)', margin: '1.5rem auto' }}></div>
          <div className="stats-badge" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            <LayoutDashboard size={18} />
            <span>Management Mode</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs" style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '3rem',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          paddingBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`btn ${activeTab === 'artworks' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Layers size={18} />
            <span>Manage Artworks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <BarChart2 size={18} />
            <span>Visitor Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Users size={18} />
            <span>Registered Users</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_requests')}
            className={`btn ${activeTab === 'custom_requests' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Mail size={18} />
            <span>Custom Requests</span>
          </button>
        </div>

        {message && (
          <div className="success-message">
            <span>✓</span> {message}
          </div>
        )}
        {error && (
          <div className="error-message">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {statsLoading ? (
              <div style={{ padding: '8rem 0', textAlign: 'center', width: '100%' }}>
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading analytics...</p>
              </div>
            ) : statsError ? (
              <div className="error-message" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <AlertCircle size={18} /> {statsError}
              </div>
            ) : !stats ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>
                No tracking statistics available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>

                {/* ── Time Slicer (Dropdown) ── */}
                <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <Clock size={16} className="text-primary" />
                      <span>Filter by Time Period:</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="analytics-days-filter"
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value)}
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          background: 'rgba(189,0,255,0.08)',
                          border: '1px solid rgba(189,0,255,0.35)',
                          borderRadius: '12px',
                          color: '#fff',
                          padding: '0.55rem 2.5rem 0.55rem 1rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          outline: 'none',
                          minWidth: '170px',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 2px 12px rgba(189,0,255,0.1)'
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(189,0,255,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(189,0,255,0.18)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(189,0,255,0.35)'; e.target.style.boxShadow = '0 2px 12px rgba(189,0,255,0.1)'; }}
                      >
                        <option value="1"  style={{ background: '#1a0a2e' }}>Today</option>
                        <option value="3"  style={{ background: '#1a0a2e' }}>Last 3 Days</option>
                        <option value="7"  style={{ background: '#1a0a2e' }}>Last 7 Days</option>
                        <option value="14" style={{ background: '#1a0a2e' }}>Last 14 Days</option>
                        <option value="30" style={{ background: '#1a0a2e' }}>Last 30 Days</option>
                        <option value="60" style={{ background: '#1a0a2e' }}>Last 60 Days</option>
                        <option value="90" style={{ background: '#1a0a2e' }}>Last 90 Days</option>
                        <option value="180" style={{ background: '#1a0a2e' }}>Last 6 Months</option>
                        <option value="365" style={{ background: '#1a0a2e' }}>Last 1 Year</option>
                        <option value="730" style={{ background: '#1a0a2e' }}>Last 2 Years</option>
                        <option value="all" style={{ background: '#1a0a2e' }}>All Time</option>
                      </select>
                      {/* Custom chevron icon */}
                      <span style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#bd00ff',
                        fontSize: '0.7rem',
                        lineHeight: 1
                      }}>▼</span>
                    </div>
                    {/* Quick badge showing active selection */}
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '20px',
                      padding: '0.3rem 0.85rem',
                    }}>
                      {timeRange === 'all' ? '📊 All Time data' : `📅 Last ${timeRange} day${Number(timeRange) > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* ── KPI Stat Cards ── */}
                <div className="analytics-stats-grid">

                  {/* Card 1: Total Visits */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(189, 0, 255, 0.15)', color: '#bd00ff' }}>
                      <Eye size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">Total Visits</span>
                      <h2 className="card-value">{stats.totalVisits}</h2>
                    </div>
                  </div>

                  {/* Card 2: Registered User Visits */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(54, 162, 235, 0.15)', color: '#36a2eb' }}>
                      <UserCheck size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">User Visits</span>
                      <h2 className="card-value">{stats.loggedInVisits}</h2>
                    </div>
                  </div>

                  {/* Card 3: Guest Visits */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(255, 159, 64, 0.15)', color: '#ff9f40' }}>
                      <Users size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">Guest Visits</span>
                      <h2 className="card-value">{stats.guestVisits}</h2>
                    </div>
                  </div>

                  {/* Card 4: Total Registered Users */}
                  <div className="analytics-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
                    <div className="card-icon-wrapper" style={{ background: 'rgba(75, 192, 192, 0.15)', color: '#4bc0c0' }}>
                      <Users size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">Registered Users</span>
                      <h2 className="card-value">{stats.totalUsers}</h2>
                    </div>
                  </div>

                  {/* Card 5: Active Users (30m) */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', position: 'relative' }}>
                      <Activity size={22} />
                      <span className="pulse-dot"></span>
                    </div>
                    <div className="card-content">
                      <span className="card-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Active Users
                      </span>
                      <h2 className="card-value">{stats.activeUsers}</h2>
                    </div>
                  </div>

                  {/* Card 6: Logins */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                      <UserCheck size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">User Logins</span>
                      <h2 className="card-value">{stats.totalLogins}</h2>
                    </div>
                  </div>

                  {/* Card 7: Registrations */}
                  <div className="analytics-card">
                    <div className="card-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                      <Plus size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">New Registers</span>
                      <h2 className="card-value">{stats.totalRegisters}</h2>
                    </div>
                  </div>

                  {/* Card 8: Custom Requests */}
                  <div className="analytics-card" onClick={() => setActiveTab('custom_requests')} style={{ cursor: 'pointer' }}>
                    <div className="card-icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                      <Mail size={22} />
                    </div>
                    <div className="card-content">
                      <span className="card-label">Custom Requests</span>
                      <h2 className="card-value">{stats.totalCustomRequests}</h2>
                    </div>
                  </div>

                </div>

                {/* ── Key Conversion & Button Taps Summary ── */}
                {(() => {
                  const getTapCount = (pattern) => {
                    if (!stats || !stats.clickCounts) return 0;
                    return stats.clickCounts
                      .filter(item => item.name && item.name.toLowerCase().includes(pattern.toLowerCase()))
                      .reduce((acc, curr) => acc + curr.count, 0);
                  };

                  const customSendRequestCount = getTapCount('Send Request');
                  const customWhatsappCount = getTapCount('Reach Out WhatsApp');
                  const customEmailCount = getTapCount('Reach Out Email');
                  const buyNowCount = getTapCount('Buy Now');
                  const placeOrderWhatsappCount = getTapCount('Place Order via WhatsApp');

                  return (
                    <div className="card" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap className="text-primary" />
                        Key Intent & Conversion Button Taps
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                        
                        {/* Send Request */}
                        <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>Custom Sketch</span>
                            <Send size={18} style={{ color: '#c084fc' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Send Request Taps</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>{customSendRequestCount}</h2>
                        </div>

                        {/* WhatsApp Reach Out */}
                        <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#25D366', fontWeight: 600 }}>Custom Sketch</span>
                            <MessageCircle size={18} style={{ color: '#25D366' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>WhatsApp Direct Taps</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>{customWhatsappCount}</h2>
                        </div>

                        {/* Email Reach Out */}
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>Custom Sketch</span>
                            <Mail size={18} style={{ color: '#38bdf8' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Email Direct Taps</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>{customEmailCount}</h2>
                        </div>

                        {/* Buy Now */}
                        <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: 600 }}>Direct Purchase</span>
                            <Zap size={18} style={{ color: '#eab308' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Buy Now Taps</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>{buyNowCount}</h2>
                        </div>

                        {/* Place Order via WhatsApp */}
                        <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>Checkout</span>
                            <MessageCircle size={18} style={{ color: '#22c55e' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>WhatsApp Order Taps</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>{placeOrderWhatsappCount}</h2>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* ── Artwork Taps by Sketch Title ── */}
                {(() => {
                  if (!stats || !stats.clickCounts) return null;

                  // Aggregate taps by sketch title
                  const sketchTapMap = {};
                  stats.clickCounts.forEach(item => {
                    const name = item.name || '';
                    let sketchTitle = null;
                    let actionType = 'Tap';

                    if (name.includes('View Gallery Artwork - ')) {
                      sketchTitle = name.replace('View Gallery Artwork - ', '');
                      actionType = 'Gallery View';
                    } else if (name.includes('View Featured Artwork - ')) {
                      sketchTitle = name.replace('View Featured Artwork - ', '');
                      actionType = 'Featured View';
                    } else if (name.includes('View Portfolio Artwork - ')) {
                      sketchTitle = name.replace('View Portfolio Artwork - ', '');
                      actionType = 'Portfolio View';
                    } else if (name.includes('Buy Now - ')) {
                      sketchTitle = name.replace('Buy Now - ', '');
                      actionType = 'Buy Now';
                    } else if (name.includes('Add to Cart - ')) {
                      sketchTitle = name.replace('Add to Cart - ', '');
                      actionType = 'Add to Cart';
                    }

                    if (sketchTitle) {
                      if (!sketchTapMap[sketchTitle]) {
                        sketchTapMap[sketchTitle] = {
                          title: sketchTitle,
                          totalTaps: 0,
                          views: 0,
                          cartTaps: 0,
                          buyNowTaps: 0
                        };
                      }
                      sketchTapMap[sketchTitle].totalTaps += item.count;
                      if (actionType.includes('View')) sketchTapMap[sketchTitle].views += item.count;
                      if (actionType === 'Add to Cart') sketchTapMap[sketchTitle].cartTaps += item.count;
                      if (actionType === 'Buy Now') sketchTapMap[sketchTitle].buyNowTaps += item.count;
                    }
                  });

                  const sketchTapList = Object.values(sketchTapMap).sort((a, b) => b.totalTaps - a.totalTaps);

                  return (
                    <div className="card" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon className="text-primary" />
                        Artwork Taps by Sketch Title
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Tracks every artwork user interactions (Views, Add to Cart, Buy Now) by their specific sketch title.
                      </p>

                      {sketchTapList.length === 0 ? (
                        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.05)' }}>
                          No specific sketch title taps recorded yet for this time range.
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sketch Title</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Page Views</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Add to Cart</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Buy Now</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>Total Taps</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sketchTapList.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(189,0,255,0.15)',
                                        color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 700
                                      }}>{idx + 1}</span>
                                      {item.title}
                                    </div>
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.views}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center', color: '#38bdf8', fontSize: '0.9rem', fontWeight: item.cartTaps > 0 ? 700 : 400 }}>{item.cartTaps}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center', color: '#eab308', fontSize: '0.9rem', fontWeight: item.buyNowTaps > 0 ? 700 : 400 }}>{item.buyNowTaps}</td>
                                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <span style={{
                                      background: 'rgba(189,0,255,0.15)', color: 'var(--primary-color)',
                                      padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 800
                                    }}>
                                      {item.totalTaps} taps
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Charts Section ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                  {/* Chart 1: Activity Trends */}
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart2 className="text-primary" />
                      Daily Traffic Trends (Visits vs Events)
                    </h3>
                    {(!stats.chartData || stats.chartData.length === 0) ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No historical traffic recorded for this timeframe.
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                              contentStyle={{
                                background: 'rgba(23, 15, 30, 0.95)',
                                borderColor: 'rgba(189, 0, 255, 0.3)',
                                borderRadius: '12px',
                                color: '#fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="visits" name="Page Visits" fill="#bd00ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actions" name="Button/Event Clicks" fill="#ff36c8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Event Type Breakdown */}
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity className="text-primary" />
                      Event Actions Distribution
                    </h3>
                    {stats.totalVisits === 0 && stats.clickCounts.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No activities to display.
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Page Visits', value: stats.totalVisits - stats.totalLogins - stats.totalRegisters },
                                { name: 'User Logins', value: stats.totalLogins },
                                { name: 'Registrations', value: stats.totalRegisters },
                                { name: 'Custom Requests', value: stats.totalCustomRequests },
                                { name: 'Clicks & Carts', value: stats.clickCounts.reduce((acc, c) => acc + c.count, 0) }
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={95}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {[
                                '#bd00ff', // Page Visits
                                '#36a2eb', // Logins
                                '#ec4899', // Registers
                                '#eab308', // Custom Requests
                                '#ff36c8'  // Clicks & Carts
                              ].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                background: 'rgba(23, 15, 30, 0.95)',
                                borderColor: 'rgba(189, 0, 255, 0.3)',
                                borderRadius: '12px',
                                color: '#fff'
                              }}
                            />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                </div>

                {/* ── Top Click Actions ── */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MousePointer className="text-primary" />
                    Top Clicked Buttons & Taps
                  </h3>

                  {stats.clickCounts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No button click interaction data recorded.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {stats.clickCounts.map((click, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '1rem',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '80%' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={click.name}>
                              {click.name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Interaction Button</span>
                          </div>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>{click.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Recent Visits Table ── */}
                <div className="card" style={{ padding: '2rem', overflowX: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity className="text-primary" />
                      Recent Activity Timeline
                    </h3>

                    {/* Action Filter Slicer */}
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {[
                        { value: 'all', label: 'All Events' },
                        { value: 'visit', label: 'Page Visits' },
                        { value: 'login', label: 'Logins' },
                        { value: 'register', label: 'Registers' },
                        { value: 'custom_request', label: 'Custom Requests' },
                        { value: 'clicks', label: 'Clicks' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`btn btn-sm ${actionFilter === opt.value ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setActionFilter(opt.value)}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', borderRadius: '15px', textTransform: 'none', letterSpacing: 'normal' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const filteredVisits = stats.recentVisits.filter(visit => {
                      if (actionFilter === 'all') return true;
                      if (actionFilter === 'visit') return visit.action === 'visit';
                      if (actionFilter === 'login') return visit.action === 'login';
                      if (actionFilter === 'register') return visit.action === 'register';
                      if (actionFilter === 'custom_request') return visit.action === 'custom_request';
                      if (actionFilter === 'clicks') return !['visit', 'login', 'register', 'custom_request'].includes(visit.action);
                      return true;
                    });

                    return filteredVisits.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No matching activity found.</p>
                    ) : (
                      <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>User / Guest</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page Route</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Action Event</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>IP & Device</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVisits.map((visit) => {
                            const isGuest = visit.isGuest;
                            const userText = isGuest
                              ? `Guest (${visit.guestId ? visit.guestId.substring(0, 8) : 'unknown'}...)`
                              : visit.userId?.name || 'Registered User';
                            const userSub = isGuest
                              ? 'Anonymous Visitor'
                              : `${visit.userId?.email || ''} [${visit.userId?.uid || 'No UID'}]`;

                            return (
                              <tr key={visit._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {!isGuest && visit.userId?._id ? (
                                      <span
                                        onClick={() => fetchUserInsight(visit.userId._id)}
                                        style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ecb2ff', cursor: 'pointer', textDecoration: 'underline' }}
                                        title="Click to view user insight"
                                      >
                                        {userText}
                                      </span>
                                    ) : (
                                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#d4c0d7' }}>
                                        {userText}
                                      </span>
                                    )}
                                    {userSub && (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {userSub}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <code style={{ color: '#bd00ff', fontSize: '0.85rem', background: 'rgba(189,0,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    {visit.page}
                                  </code>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  {visit.action === 'visit' ? (
                                    <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                      Page Visit
                                    </span>
                                  ) : visit.action === 'login' ? (
                                    <span style={{ fontSize: '0.75rem', color: '#36a2eb', background: 'rgba(54,162,235,0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                      Login Event
                                    </span>
                                  ) : visit.action === 'register' ? (
                                    <span style={{ fontSize: '0.75rem', color: '#ec4899', background: 'rgba(236,72,153,0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                      Registration
                                    </span>
                                  ) : visit.action === 'custom_request' ? (
                                    <span style={{ fontSize: '0.75rem', color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                      Custom Request
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#ff36c8', background: 'rgba(255,54,200,0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                      Click: {visit.action}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IP: {visit.ip}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={visit.userAgent}>
                                      UA: {visit.userAgent}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  {new Date(visit.visitedAt).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── Registered Users Tab ── */}
        {activeTab === 'users' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Registered User Directory</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Assigns unique UIDs to track specific user journeys.</p>
                </div>

                {/* Search Slicer */}
                <div style={{ position: 'relative', minWidth: '280px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by UID, Name, or Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', margin: 0 }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>

              {usersLoading ? (
                <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading user directory...</p>
                </div>
              ) : (() => {
                const filteredUsers = usersList.filter(u =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (u.uid && u.uid.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return filteredUsers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No users match the search query.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>User ID (UID)</th>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name</th>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email</th>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Actions Logged</th>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Active</th>
                          <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Insights</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                              {u.uid || 'Pending'}
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>
                              {u.name} {u.role === 'admin' && <span style={{ fontSize: '0.7rem', color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Admin</span>}
                            </td>
                            <td style={{ padding: '1rem', color: '#d4c0d7' }}>{u.email}</td>
                            <td style={{ padding: '1rem', color: '#ff36c8', fontWeight: 600 }}>{u.totalActions} actions</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Never'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => fetchUserInsight(u._id)}
                                style={{ borderRadius: '15px', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                              >
                                View Timeline
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── Custom Requests Tab ── */}
        {activeTab === 'custom_requests' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Custom Sketch Commission Requests</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Stored in database. Action items and customer email communication.</p>
              </div>

              {customRequestsLoading ? (
                <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading commission requests...</p>
                </div>
              ) : customRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No custom sketch requests found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Request ID</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vision & Description</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Reference Image</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Submitted At</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customRequests.map((reqItem) => {
                        return (
                          <tr key={reqItem._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                              {reqItem.uid || 'CR-000'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600 }}>{reqItem.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reqItem.email}</span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem', maxWidth: '300px' }}>
                              <p style={{ margin: 0, color: '#e2d5e5', lineHeight: '1.4' }}>{reqItem.description || 'No description provided'}</p>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {reqItem.referenceUrl ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {reqItem.referenceUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || reqItem.referenceUrl.includes('/uploads/') ? (
                                    <img
                                      src={reqItem.referenceUrl.startsWith('/') ? `${API_BASE}${reqItem.referenceUrl}` : reqItem.referenceUrl}
                                      alt="Thumbnail"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : null}
                                  <a
                                    href={reqItem.referenceUrl.startsWith('/') ? `${API_BASE}${reqItem.referenceUrl}` : reqItem.referenceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#ff36c8', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                  >
                                    View link <ExternalLink size={12} />
                                  </a>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None Provided</span>
                              )}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {new Date(reqItem.createdAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <a
                                href={`mailto:${reqItem.email}?subject=Reply to Custom Sketch Request [${reqItem.uid}]&body=Hi ${reqItem.name},%0D%0A%0D%0AThank you for submitting your custom sketch request (UID: ${reqItem.uid}) regarding:%0D%0A"${reqItem.description}"%0D%0A%0D%0AI have reviewed your details and reference...`}
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: '15px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-block' }}
                              >
                                Email Client
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Manage Artworks Tab ── */}
        {activeTab === 'artworks' && (
          <div className="admin-layout-grid">

            {/* ── Form ── */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {editId ? <Layers size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
                {editId ? 'Edit Artwork' : 'Add New Artwork'}
              </h2>

              <form onSubmit={submitHandler}>
                <div className="form-group">
                  <label className="form-label">TITLE *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Divine Krishna"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">PRICE (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SIZE *</label>
                    <select
                      className="form-control"
                      value={sizeType}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setSizeType(selected);
                        if (selected !== 'Custom') {
                          setSize(selected);
                        } else {
                          if (size === 'A3' || size === 'A4' || size === 'A5') {
                            setSize('');
                          }
                        }
                      }}
                      required
                    >
                      <option value="A4">📄 A4 Size</option>
                      <option value="A3">📄 A3 Size</option>
                      <option value="A5">📄 A5 Size</option>
                      <option value="Custom">✨ Custom Size...</option>
                    </select>

                    {sizeType === 'Custom' && (
                      <input
                        type="text"
                        className="form-control"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="Specify custom size (e.g., 12x18 inches)"
                        required
                        style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}
                      />
                    )}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">CATEGORY *</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="God Sketches">🕉️ God Sketches</option>
                      <option value="Portraits">👤 Portraits</option>
                      <option value="Custom Sketches">🎨 Custom Sketches</option>
                      <option value="Mobile Cover Sketch">📱 Mobile Cover Sketch</option>
                      <option value="Other">✨ Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">MEDIUM</label>
                    <select
                      className="form-control"
                      value={mediumType}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setMediumType(selected);
                        if (selected !== 'Custom') {
                          setMedium(selected);
                        } else {
                          if (medium === 'Graphite' || medium === 'Charcoal' || medium === 'Both' || medium === 'Graphite & Charcoal' || medium === 'Pen Art') {
                            setMedium('');
                          }
                        }
                      }}
                    >
                      <option value="">Select medium</option>
                      <option value="Graphite">Graphite</option>
                      <option value="Charcoal">Charcoal</option>
                      <option value="Both">Both (Graphite & Charcoal)</option>
                      <option value="Graphite & Charcoal">Graphite & Charcoal</option>
                      <option value="Pen Art">✒️ Pen Art</option>
                      <option value="Custom">✨ Custom Medium...</option>
                    </select>

                    {mediumType === 'Custom' && (
                      <input
                        type="text"
                        className="form-control"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        placeholder="Specify custom medium (e.g., Oil Paint, Colored Pencil)"
                        required
                        style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}
                      />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">TAGLINE</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g., The Divine Presence"
                  />
                </div>

                {/* ── Image Upload Section ── */}
                <div className="form-group">
                  <label className="form-label">IMAGES * ({images.length})</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* URL input */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={imagePreview}
                        onChange={(e) => setImagePreview(e.target.value)}
                        placeholder="Paste Image URL"
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          if (imagePreview.trim()) {
                            setImages((prev) => [...prev, imagePreview.trim()]);
                            setImagePreview('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {/* File upload drop zone */}
                    <div
                      className="upload-area"
                      style={{
                        position: 'relative',
                        textAlign: 'center',
                        padding: '1.5rem',
                        border: '2px dashed var(--outline-variant, #514255)',
                        borderRadius: '1rem',
                        transition: 'border-color 0.3s',
                      }}
                    >
                      <input
                        type="file"
                        onChange={uploadFileHandler}
                        accept="image/jpeg,image/png,image/webp"
                        style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                      />
                      <ImageIcon size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant, #d4c0d7)' }}>
                        {uploading ? '⏳ Uploading...' : 'Click or drag an image to upload'}
                      </p>
                      {selectedFileRef.current && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                          ✓ {selectedFileRef.current.name} ready for AI
                        </p>
                      )}
                    </div>

                    {/* ── AI Generation — always visible, disabled until file is chosen ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Keywords (Optional) e.g., 'Shiva, peace'"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        className="ai-caption-btn"
                        onClick={handleGeminiAI}
                        disabled={aiLoading || !selectedFileRef.current}
                        title={!selectedFileRef.current ? 'Upload an image first to enable AI generation' : ''}
                      >
                        <Sparkles size={16} />
                        {aiLoading ? 'Generating with Gemini...' : '✨ Generate with Gemini AI'}
                      </button>
                      {!selectedFileRef.current && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                          Upload an image above to enable AI generation
                        </p>
                      )}
                    </div>

                    {/* Image thumbnails */}
                    {images.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '1rem',
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '0.5rem',
                      }}>
                        {images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', aspectRatio: '1/1' }}>
                            <img
                              src={img}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--danger)',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">KEYWORDS (FOR CLIENT SEARCHING)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., Shiva, devotional, charcoal, portrait (comma separated)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DESCRIPTION *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe the artwork..."
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem' }}>
                    {editId ? 'Update Artwork' : 'Publish Artwork'}
                  </button>
                  {editId && (
                    <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── Collection List ── */}
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Current Collection</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sketches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No artworks yet.</p>
                  </div>
                ) : (
                  sketches.map((sketch) => (
                    <div
                      key={sketch._id}
                      className="collection-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--bg-card)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <img
                        src={sketch.images[0]}
                        alt={sketch.title}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{sketch.title}</h3>
                        <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          ₹{sketch.price}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => editHandler(sketch)}
                          style={{ padding: '0.5rem', color: 'var(--primary-color)', cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                          <Layers size={18} />
                        </button>
                        <button
                          onClick={() => deleteHandler(sketch._id)}
                          style={{ padding: '0.5rem', color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── User Insight Modal ── */}
        {selectedUserInsight && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 5, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '2rem',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid rgba(189, 0, 255, 0.35)',
              boxShadow: '0 10px 40px rgba(189, 0, 255, 0.15)',
              position: 'relative',
              padding: '2.5rem',
              background: 'var(--bg-card, #170f1e)'
            }}>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedUserInsight(null)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Header */}
                <div>
                  <span className="gallery-badge" style={{ marginBottom: '0.5rem' }}>User Insight Logs</span>
                  <h2 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0.5rem 0' }}>
                    {selectedUserInsight.user.name}
                    <span style={{ color: 'var(--primary-color)', marginLeft: '0.5rem', fontSize: '1.1rem' }}>
                      ({selectedUserInsight.user.uid || 'Legacy User'})
                    </span>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Email: <span style={{ color: '#fff' }}>{selectedUserInsight.user.email}</span> | Phone: <span style={{ color: '#fff' }}>{selectedUserInsight.user.phone || 'N/A'}</span>
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    Joined on {new Date(selectedUserInsight.user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}></div>

                {/* Timeline */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} className="text-primary" />
                    Journey Timeline ({selectedUserInsight.activities.length} Recorded Actions)
                  </h3>

                  {selectedUserInsight.activities.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No activity logged yet for this user.</p>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      paddingRight: '0.5rem'
                    }}>
                      {selectedUserInsight.activities.map((act, idx) => {
                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem',
                            alignItems: 'start'
                          }}>
                            {/* Icon selection */}
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: act.action === 'visit'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : act.action === 'login'
                                  ? 'rgba(54, 162, 235, 0.15)'
                                  : act.action === 'register'
                                    ? 'rgba(236, 72, 153, 0.15)'
                                    : act.action === 'custom_request'
                                      ? 'rgba(234, 179, 8, 0.15)'
                                      : 'rgba(255, 54, 200, 0.15)',
                              color: act.action === 'visit'
                                ? '#10b981'
                                : act.action === 'login'
                                  ? '#36a2eb'
                                  : act.action === 'register'
                                    ? '#ec4899'
                                    : act.action === 'custom_request'
                                      ? '#eab308'
                                      : '#ff36c8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {act.action === 'visit' ? (
                                <Eye size={14} />
                              ) : act.action === 'login' || act.action === 'register' ? (
                                <UserCheck size={14} />
                              ) : act.action === 'custom_request' ? (
                                <Mail size={14} />
                              ) : (
                                <MousePointer size={14} />
                              )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                {act.action === 'visit'
                                  ? `Visited Page: ${act.page}`
                                  : act.action === 'login'
                                    ? `Logged in to platform`
                                    : act.action === 'register'
                                      ? `Registered new user account`
                                      : act.action === 'custom_request'
                                        ? `Submitted a custom sketch commission request`
                                        : `Clicked Interaction Element: "${act.action}"`}
                              </span>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span>IP: {act.ip}</span>
                                <span>Time: {new Date(act.visitedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-layout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 3rem;
          align-items: start;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .admin-layout-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
        .stats-badge {
          background: rgba(189, 0, 255, 0.1);
          border: 1px solid rgba(189, 0, 255, 0.25);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ecb2ff;
        }
        .upload-area:hover {
          border-color: var(--primary-container, #bd00ff) !important;
          background: rgba(189,0,255,0.05) !important;
        }
        .ai-caption-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #bd00ff 0%, #ff36c8 100%);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 24px rgba(189, 0, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .ai-caption-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff36c8 0%, #bd00ff 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .ai-caption-btn:hover:not(:disabled)::before { opacity: 1; }
        .ai-caption-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 40px rgba(189, 0, 255, 0.5);
        }
        .ai-caption-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .ai-caption-btn:disabled[data-loading="true"] {
          animation: aiPulse 1.5s ease-in-out infinite;
        }
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(189, 0, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 54, 200, 0.6); }
        }
        .gallery-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(112, 0, 255, 0.1);
          color: var(--primary-color);
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }

        /* ── Visitor Tracking Custom Styles ── */
        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }
        .analytics-card {
          background: var(--bg-card, rgba(23, 15, 30, 0.6));
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: 1.25rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .analytics-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(189, 0, 255, 0.15);
          border-color: rgba(189, 0, 255, 0.3);
        }
        .card-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-content {
          display: flex;
          flex-direction: column;
        }
        .card-label {
          font-size: 0.75rem;
          color: var(--text-muted, #d4c0d7);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .card-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0.25rem 0 0 0;
          color: #fff;
        }
        .analytics-table th {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .analytics-table tr {
          transition: background-color 0.2s ease;
        }
        .analytics-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .analytics-table td {
          vertical-align: middle;
        }
        .pulse-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pulseGreen 2s infinite;
        }
        @keyframes pulseGreen {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      {/* ══════════ User Detail Modal ══════════ */}
      {(selectedUserInsight || insightLoading) && (
        <div
          onClick={() => setSelectedUserInsight(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1a0a2e 0%, #12001f 100%)',
              border: '1px solid rgba(189,0,255,0.25)',
              borderRadius: '1.5rem',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(189,0,255,0.1)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {insightLoading ? (
              <div style={{ padding: '5rem', textAlign: 'center' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading user profile...</p>
              </div>
            ) : selectedUserInsight && (() => {
              const { user, activities } = selectedUserInsight;
              const totalLogins = activities.filter(a => a.action === 'login').length;
              const totalVisits = activities.filter(a => a.action === 'visit').length;
              const totalRegisters = activities.filter(a => a.action === 'register').length;
              const totalClicks = activities.filter(a => !['login','visit','register','custom_request'].includes(a.action)).length;
              const lastSeen = activities[0]?.visitedAt;
              return (
                <>
                  {/* Header */}
                  <div style={{
                    padding: '2rem 2rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      {/* Avatar circle */}
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #bd00ff 0%, #ff36c8 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 0 20px rgba(189,0,255,0.4)'
                      }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>{user.name}</h2>
                          {user.role === 'admin' && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(234,179,8,0.3)' }}>ADMIN</span>
                          )}
                          <span style={{ fontSize: '0.7rem', background: 'rgba(189,0,255,0.12)', color: '#bd00ff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(189,0,255,0.25)' }}>{user.uid || 'No UID'}</span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
                        {lastSeen && <p style={{ margin: '0.15rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Last seen: {new Date(lastSeen).toLocaleString()}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUserInsight(null)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1rem', flexShrink: 0 }}
                    >✕</button>
                  </div>

                  {/* Profile Info + Stats */}
                  <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                      {[
                        { label: 'Phone', value: user.phone || '—', icon: '📞' },
                        { label: 'Address', value: user.address || '—', icon: '📍' },
                        { label: 'Joined', value: new Date(user.createdAt).toLocaleDateString(), icon: '📅' },
                        { label: 'Role', value: user.role?.toUpperCase(), icon: '🔑' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{item.icon} {item.label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e8d8ff', wordBreak: 'break-word' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Activity Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                      {[
                        { label: 'Total Events', value: activities.length, color: '#bd00ff', bg: 'rgba(189,0,255,0.1)' },
                        { label: 'Page Visits', value: totalVisits, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                        { label: 'Logins', value: totalLogins, color: '#36a2eb', bg: 'rgba(54,162,235,0.1)' },
                        { label: 'Clicks', value: totalClicks, color: '#ff36c8', bg: 'rgba(255,54,200,0.1)' },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: '0.875rem', padding: '0.85rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Activity Timeline */}
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>📋 Activity Timeline ({activities.length} events)</h3>
                      {activities.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No activity recorded for this user.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                          {activities.map((act, idx) => {
                            const isLogin = act.action === 'login';
                            const isVisit = act.action === 'visit';
                            const isRegister = act.action === 'register';
                            const isCR = act.action === 'custom_request';
                            const badgeColor = isLogin ? '#36a2eb' : isVisit ? '#10b981' : isRegister ? '#ec4899' : isCR ? '#eab308' : '#ff36c8';
                            const badgeBg = isLogin ? 'rgba(54,162,235,0.12)' : isVisit ? 'rgba(16,185,129,0.12)' : isRegister ? 'rgba(236,72,153,0.12)' : isCR ? 'rgba(234,179,8,0.12)' : 'rgba(255,54,200,0.12)';
                            const badgeLabel = isLogin ? '🔑 Login' : isVisit ? '👁 Visit' : isRegister ? '✅ Register' : isCR ? '🎨 Custom Req' : `🖱 ${act.action}`;
                            return (
                              <div key={act._id || idx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '0.75rem', padding: '0.65rem 0.85rem'
                              }}>
                                <span style={{ background: badgeBg, color: badgeColor, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: '100px', textAlign: 'center', border: `1px solid ${badgeColor}33` }}>
                                  {badgeLabel}
                                </span>
                                <code style={{ color: '#bd00ff', fontSize: '0.78rem', background: 'rgba(189,0,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {act.page}
                                </code>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {new Date(act.visitedAt).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
