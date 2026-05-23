import React, { useState } from 'react';
import { MessageSquare, X, Star, Send, CheckCircle2 } from 'lucide-react';
import './FeedbackModal.css';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: '',
    category: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Basic email validation if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', rating: 0, message: '', category: '' });
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="feedback-floating-btn" 
        onClick={() => setIsOpen(true)}
        aria-label="Feedback"
      >
        <MessageSquare size={24} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="feedback-modal-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal-content slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="feedback-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            {success ? (
              <div className="feedback-success">
                <CheckCircle2 size={48} className="text-primary mb-2" />
                <h3>Thank You!</h3>
                <p>Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <h3 className="feedback-title">We Value Your Feedback</h3>
                <p className="feedback-subtitle">Help us improve your experience.</p>
                
                {error && <div className="feedback-error">{error}</div>}

                <form onSubmit={handleSubmit} className="feedback-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Your name (optional)"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Your email (optional)"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="form-control"
                    >
                      <option value="">Select Category (optional)</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Experience">Experience</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>

                  <div className="form-group rating-group">
                    <label>Rating</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={`star-btn ${(hoveredRating || formData.rating) >= star ? 'active' : ''}`}
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          <Star size={24} fill={(hoveredRating || formData.rating) >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      placeholder="Tell us what you think..."
                      className="form-control"
                      rows="4"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary submit-feedback-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : (
                      <>
                        Submit Feedback <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
