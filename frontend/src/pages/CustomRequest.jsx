// CustomRequest.jsx
import React, { useState } from 'react';
import { Send, MessageCircle, Mail, Sparkles, Upload, Zap, X } from 'lucide-react';

const CustomRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    referenceUrl: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploading(true);
    setUploadError('');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      setUploadedImage(data.image);
      setFormData(prev => ({
        ...prev,
        referenceUrl: window.location.origin + data.image
      }));
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setFormData(prev => ({ ...prev, referenceUrl: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would send to backend, for now just show success
    const subject = `Custom Sketch Request from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\nDescription: ${formData.description}\nReference: ${formData.referenceUrl}`;
    window.location.href = `mailto:maheshwagh113@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="custom-request-page">
      <div className="container">
        <div className="request-header">
          <span className="badge">COMMISSION ART</span>
          <h1>Custom Sketch <span className="text-gradient">Request</span></h1>
          <p>Tell Me What You Can't Forget, I'll Make Sure You Never Do.</p>
          <div style={{ width: '80px', height: '3px', background: "var(--primary-gradient)", margin: '1.5rem auto' }}></div>
        </div>

        <div className="request-grid">
          <div className="request-info">
            <div className="info-card">
              <Sparkles size={32} className="info-icon" />
              <h3>What Can I Create?</h3>
              <div className="process-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <span>Portraits that stop people</span>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <span>Gods drawn close enough to feel</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span>Couples captured forever</span>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <span>The person who means everything</span>
                </div>
                <div className="step">
                  <span className="step-number">5</span>
                  <span>Mobile covers, only yours</span>
                </div>
              </div>
            </div>
            <div className="info-card">
              <Zap size={32} className="info-icon" />
              <h3>Process & Timeline</h3>
              <div className="process-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <span>Share your idea/reference</span>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <span>Get a price quote </span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span>First look at what I created</span>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <span>Final approval</span>
                </div>
                <div className="step">
                  <span className="step-number">5</span>
                  <span>Handed over to you forever</span>
                </div>
              </div>
            </div>
          </div>

          <div className="request-form-container">
            <form onSubmit={handleSubmit} className="request-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Describe Your Vision *</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Tell me about what you want — portrait of someone, specific deity, style preferences, size, etc." required></textarea>
              </div>
              <div className="form-group">
                <label>Reference Image URL (optional)</label>
                <input type="url" name="referenceUrl" value={formData.referenceUrl} onChange={handleChange} placeholder="Pinterest/Instagram/Google Drive link" />
              </div>
              <div className="form-group upload-group">
                <label>Or Upload Reference Image (optional)</label>
                <div
                  className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadedImage && !uploading && document.getElementById('reference-file').click()}
                >
                  <input
                    type="file"
                    id="reference-file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {uploadedImage ? (
                    <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                      <img src={uploadedImage} alt="Reference Preview" className="upload-preview" />
                      <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-label">
                      {uploading ? (
                        <span className="upload-text">Uploading image...</span>
                      ) : (
                        <>
                          <Upload size={24} className="upload-icon" />
                          <span className="upload-text">Click to upload or drag & drop</span>
                          <span className="upload-hint">Supports JPG, PNG, WEBP (Max 5MB)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {uploadError && <span className="upload-error-msg">{uploadError}</span>}
              </div>
              {submitted && <div className="success-message">✓ Request sent! I'll get back to you within 24 hours.</div>}
              <button type="submit" className="btn btn-primary submit-btn">
                <Send size={18} /> Send Request
              </button>
            </form>

            <div className="direct-contact">
              <p>Or reach out directly:</p>
              <div className="contact-buttons">
                <a href="https://wa.me/917387062073?text=Hi! I'd like to commission a custom sketch." target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                  <MessageCircle size={20} /> WhatsApp
                </a>
                <a href="mailto:maheshwagh113@gmail.com?subject=Custom Sketch Commission" className="email-btn">
                  <Mail size={20} /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-request-page {
          padding: 6rem 0;
        }
        .upload-group {
          margin-top: 1.5rem;
        }
        .upload-zone {
          border: 2px dashed var(--border-color);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--primary-color);
          background: rgba(112, 0, 255, 0.05);
        }
        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          width: 100%;
        }
        .upload-icon {
          color: var(--text-muted);
          transition: color 0.3s ease;
        }
        .upload-zone:hover .upload-icon {
          color: var(--primary-color);
        }
        .upload-text {
          font-weight: 600;
          color: #fff;
        }
        .upload-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .preview-container {
          position: relative;
          display: inline-block;
          max-width: 150px;
          margin: 0 auto;
        }
        .upload-preview {
          width: 100%;
          max-height: 150px;
          object-fit: contain;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }
        .remove-img-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff3333;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: background 0.2s;
        }
        .remove-img-btn:hover {
          background: #cc0000;
        }
        .upload-error-msg {
          color: #ff3333;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: block;
        }
        .request-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .badge {
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
        .request-header h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
        }
        .request-header p {
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }
        .request-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
        }
        .request-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .info-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .info-icon {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }
        .info-card h3 {
          margin-bottom: 1.5rem;
        }
        .info-card ul {
          list-style: none;
          padding: 0;
        }
        .info-card li {
          padding: 0.5rem 0;
          color: var(--text-muted);
        }
        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .step {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .step-number {
          width: 32px;
          height: 32px;
          background: rgba(112, 0, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--primary-color);
        }
        .request-form-container {
          background: var(--bg-card);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid var(--border-color);
        }

        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
        }

        .direct-contact {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        .direct-contact p {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .contact-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .whatsapp-btn, .email-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          text-decoration: none;
          font-weight: 600;
          transition: 0.3s;
        }
        .whatsapp-btn {
          background: #25D366;
          color: white;
        }
        .whatsapp-btn:hover {
          background: #20bd59;
          transform: translateY(-2px);
        }
        .email-btn {
          background: var(--bg-dark);
          color: white;
          border: 1px solid var(--border-color);
        }
        .email-btn:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }
        @media (max-width: 968px) {
          .request-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .request-form-container {
            order: -1;
          }
        }
        @media (max-width: 768px) {
          .custom-request-page {
            padding: 5rem 0 3rem;
          }
          .request-header {
            margin-bottom: 2.5rem;
          }
          .request-header h1 {
            font-size: clamp(1.6rem, 5vw, 2.2rem);
          }
          .request-header p {
            font-size: 0.95rem;
          }
          .info-card {
            padding: 1.5rem 1.25rem;
            border-radius: 1rem;
          }
          .request-form-container {
            padding: 1.5rem 1.25rem;
            border-radius: 1rem;
          }
          .contact-buttons {
            flex-direction: column;
            gap: 0.75rem;
          }
          .whatsapp-btn, .email-btn {
            width: 100%;
            justify-content: center;
            padding: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomRequest;
