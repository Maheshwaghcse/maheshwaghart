// Gallery.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid3x3, Grid, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategories = useMemo(() => {
    if (loading) {
      return ['All', 'God Sketches', 'Portraits', 'Custom Sketches', 'Mobile Cover Sketch'];
    }
    const unique = new Set(sketches.map(s => s.category));
    const baseCategories = ['God Sketches', 'Portraits', 'Custom Sketches', 'Mobile Cover Sketch'];
    const presentCategories = baseCategories.filter(c => unique.has(c));
    const others = Array.from(unique).filter(c => c && !baseCategories.includes(c));
    return ['All', ...presentCategories, ...others];
  }, [sketches, loading]);

  useEffect(() => {
    const fetchSketches = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSketches(data);
        } else {
          throw new Error('Fetched data is not an array');
        }
      } catch (error) {
        console.error('Failed to fetch sketches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSketches();
  }, []);

  const filteredSketches = useMemo(() => {
    return sketches.filter(sketch => {
      return (filter === 'All' || sketch.category === filter) &&
        sketch.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sketches, filter, searchTerm]);

  return (
    <div className="gallery-page">
      <div className="container">
        <div className="gallery-header">
          <div>
            <span className="gallery-badge">ART COLLECTION</span>
            <h1>Browse Sketch <span className="text-gradient">Gallery</span></h1>
            {loading ? (
              <p style={{ opacity: 0.5 }}>Loading collection...</p>
            ) : (
              <p>{filteredSketches.length} pieces of timeless artistry</p>
            )}
          </div>

          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
            Filters
          </button>
        </div>

        <div className={`filters-panel ${showFilters ? 'active' : ''}`}>
          <div className="filters-top-row">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                <Grid3x3 size={18} />
              </button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                <Grid size={18} />
              </button>
            </div>
          </div>

          <div className="category-filters">
            {activeCategories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={`gallery-grid ${viewMode}`}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={`skel-${idx}`} className="gallery-card skeleton-card">
                <div className="card-image-wrapper skeleton-img" style={{ aspectRatio: '1' }}></div>
                <div className="card-info">
                  <div className="skeleton-text" style={{ width: '40%', marginBottom: '0.5rem', height: '0.8rem' }}></div>
                  <div className="skeleton-text" style={{ width: '80%', marginBottom: '0.5rem', height: '1.2rem' }}></div>
                  <div className="skeleton-text" style={{ width: '30%', height: '1rem' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSketches.length > 0 ? (
          <div className={`gallery-grid ${viewMode}`}>
            {filteredSketches.map((sketch, index) => (
              <Link to={`/product/${sketch._id}`} key={sketch._id} className="gallery-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="card-image-wrapper">
                  <img src={sketch.images[0]} alt={sketch.title} />
                  <div className="card-overlay">
                    <span className="view-detail">View Details →</span>
                  </div>
                </div>
                <div className="card-info">
                  <span className="card-category">{sketch.tagline || sketch.category}</span>
                  <h3 className="card-title">{sketch.title}</h3>
                  <p className="card-price">₹{sketch.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <Search size={48} />
            <h3>No artworks found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button onClick={() => { setFilter('All'); setSearchTerm(''); }} className="btn btn-outline">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        .gallery-page {
          padding: 6rem 0;
        }
        .gallery-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 3rem;
          width: 100%;
        }
        
        /* ─── Skeleton Loaders ─── */
        .skeleton-card {
          pointer-events: none;
        }
        .skeleton-img {
          background: rgba(189, 0, 255, 0.05);
          animation: skeletonShimmer 1.5s infinite linear;
        }
        .skeleton-text {
          background: rgba(189, 0, 255, 0.05);
          border-radius: 4px;
          animation: skeletonShimmer 1.5s infinite linear;
        }
        @keyframes skeletonShimmer {
          0% { background-color: rgba(189, 0, 255, 0.05); }
          50% { background-color: rgba(189, 0, 255, 0.15); }
          100% { background-color: rgba(189, 0, 255, 0.05); }
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
        .gallery-header h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 0.5rem;
        }
        .gallery-header p {
          color: var(--text-muted);
        }
        .filter-toggle {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 2rem;
          cursor: pointer;
          transition: 0.3s;
        }
        .filters-panel {
          background: var(--bg-card);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 3rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .filters-top-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 280px;
        }
        .search-bar {
          flex: 1;
          min-width: 200px;
          height: 42px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1.25rem;
          background: var(--bg-dark);
          border-radius: 99px;
          border: 1px solid var(--border-color);
        }
        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          outline: none;
        }
        .clear-search {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0;
        }
        .category-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .category-btn {
          padding: 0.5rem 1.25rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 99px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          transition: 0.3s;
          white-space: nowrap;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .category-btn.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }
        .category-btn:hover:not(.active) {
          border-color: var(--primary-color);
          color: white;
        }
        .view-toggle {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .view-toggle button {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          border-radius: 99px;
          cursor: pointer;
          transition: 0.3s;
          color: rgba(255, 255, 255, 0.6);
        }
        .view-toggle button.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }
        .gallery-grid {
          display: grid;
          gap: 2rem;
        }
        .gallery-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }
        .gallery-grid.list {
          grid-template-columns: 1fr;
        }
        .gallery-card {
          text-decoration: none;
          color: inherit;
          background: var(--bg-card);
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gallery-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 30px rgba(112, 0, 255, 0.15), 0 0 20px rgba(112, 0, 255, 0.1);
          border-color: var(--primary-color);
        }
        .card-image-wrapper {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
        }
        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .gallery-card:hover .card-image-wrapper img {
          transform: scale(1.05);
        }
        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gallery-card:hover .card-overlay {
          opacity: 1;
        }
        .view-detail {
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .card-info {
          padding: 1rem;
        }
        .card-category {
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem;
          color: var(--primary-color);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .card-title {
          font-family: 'Epilogue', sans-serif;
          font-size: 1.25rem;
          margin: 0.5rem 0;
          font-weight: 700;
        }
        .card-price {
          font-family: 'Manrope', sans-serif;
          color: var(--secondary-color, #bd00ff);
          font-weight: 800;
          font-size: 1.2rem;
        }
        .loading-gallery {
          text-align: center;
          padding: 4rem;
        }
        .no-results {
          text-align: center;
          padding: 4rem;
          color: var(--text-muted);
        }
        .no-results svg {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .no-results h3 {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .filter-toggle {
            display: none;
          }
          .filters-panel {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .filters-top-row {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .category-filters {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            gap: 0.5rem;
            padding: 0.5rem 0;
            justify-content: flex-start;
          }
          .category-filters::-webkit-scrollbar {
            display: none;
          }
          .gallery-grid {
            gap: 1rem;
            justify-content: center;
            justify-items: center;
          }
          .gallery-grid.grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .gallery-header h1 {
            font-size: clamp(1.5rem, 6vw, 2.2rem);
            margin-bottom: 0.25rem;
          }
          .gallery-header p {
            font-size: 0.85rem;
          }
          .card-title {
            font-size: clamp(0.78rem, 3.2vw, 0.88rem);
            margin: 0.2rem 0;
            font-weight: 600;
            line-height: 1.3;
          }
          .card-price {
            font-size: clamp(0.78rem, 3.2vw, 0.88rem);
            font-weight: 700;
          }
          .card-category {
            font-size: clamp(0.5rem, 2.5vw, 0.58rem);
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--primary-color);
            display: block;
            margin-bottom: 0.1rem;
          }
          .card-info {
            padding: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Gallery;