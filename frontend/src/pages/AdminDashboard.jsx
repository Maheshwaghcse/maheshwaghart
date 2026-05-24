// AdminDashboard.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, LayoutDashboard, Image as ImageIcon, Layers, X, AlertCircle, Sparkles } from 'lucide-react';

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

  // Resolve backend base URL once
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    } else {
      fetchSketches();
    }
  }, [userInfo, navigate]);

  const fetchSketches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sketches`);
      const data = await res.json();
      setSketches(data);
    } catch (err) {
      console.error('Failed to fetch sketches:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
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
    setMedium(sketch.medium || '');
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
        setMedium(freshSketch.medium || '');
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', alignItems: 'start' }}>

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                  >
                    <option value="">Select medium</option>
                    <option value="Graphite">Graphite</option>
                    <option value="Charcoal">Charcoal</option>
                    <option value="Both">Both (Graphite & Charcoal)</option>
                    <option value="Graphite & Charcoal">Graphite & Charcoal</option>
                  </select>
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
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;
