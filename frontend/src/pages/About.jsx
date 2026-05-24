// About.jsx
import React from 'react';
import { Shield, PenTool, Image as ImageIcon, Heart, Award, Users, Clock, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page animate-fade-in">
      <div className="container">
        <div className="about-header">

          <span className="gallery-badge">ABOUT ARTIST</span>
          <h1>
            The Person Behind <span className="text-gradient">The Art</span>
          </h1>
          <p className="about-subtitle">Not a studio. Not a team. Just one person who can't stop.</p>
          <div className="title-divider"></div>
        </div>

        <div className="about-cards-grid">
          <div className="card about-card">
            <div className="icon-circle">
              <Shield size={36} className="text-primary" />
            </div>
            <h3>The Promise</h3>
            <p>
              You'll never have to explain why you bought it.
              People will walk into the room, stop, and ask who made it. That's the only quality guarantee I offer.
            </p>
          </div>

          <div className="card about-card">
            <div className="icon-circle">
              <Heart size={36} className="text-primary" />
            </div>
            <h3>Crafted with Love</h3>
            <p>
              I don't finish a piece. I stop when it stops me.
              Hours go into a single expression. A jaw. The catch of
              light in an eye. I'm not done when it looks good —
              I'm done when it looks alive.
            </p>
          </div>

          <div className="card about-card">
            <div className="icon-circle">
              <Award size={36} className="text-primary" />
            </div>
            <h3>5+ Years Excellence</h3>
            <p>
              Over 100+ portraits delivered worldwide with 100% client satisfaction. Your trust is my greatest award.
            </p>
          </div>
        </div>

        <div className="card philosophy-card">
          <h2>My Artistic Philosophy</h2>
          <p className="philosophy-quote">
            "Art is not what you see, but what you make others see."
          </p>
          <p className="philosophy-desc">
            A portrait of someone you love, rendered so precisely it hurts to look away. If you're here yours is probably one I can do justice to.
          </p>
          <div className="profile-row">
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/20250718_120306.jpg`}
              alt="Artist signature"
              className="profile-img"
            />
            <div className="profile-info">
              <p className="profile-name">Mahesh Wagh</p>
              <p className="profile-bio">Self-taught artist. Software engineer. Obsessed with both but only one keeps me up at night.</p>
              <p className="profile-loc">
                <MapPin size={12} /> Pune, India
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-page {
          padding: 6rem 0;
        }
        .about-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .about-header h1 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          margin-top: 1rem;
        }
        .about-subtitle {
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: #c8c8cc;
        }
        .title-divider {
          width: 80px;
          height: 3px;
          background: var(--primary-gradient);
          margin: 1.5rem auto;
        }
        .about-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          margin-bottom: 4rem;
        }
        .about-card {
          padding: 2.5rem;
          text-align: center;
        }
        .about-card p {
          color: var(--text-muted);
          line-height: 1.7;
        }
        .about-card h3 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        .philosophy-card {
          padding: 3rem;
          background: linear-gradient(135deg, rgba(112,0,255,0.08) 0%, rgba(0,0,0,0) 100%);
          border-left: 4px solid var(--primary-color);
        }
        .philosophy-card h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
        }
        .philosophy-quote {
          color: var(--text-muted);
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-style: italic;
        }
        .philosophy-desc {
          color: var(--text-muted);
          font-size: 1rem;
          line-height: 1.8;
        }
        .profile-row {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .profile-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .profile-name {
          fontWeight: bold;
        }
        .profile-bio {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .profile-loc {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .icon-circle {
          width: 80px;
          height: 80px;
          background: rgba(112, 0, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: 0.3s ease;
        }
        .card:hover .icon-circle {
          transform: scale(1.1);
          background: rgba(112, 0, 255, 0.2);
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

        @media (max-width: 768px) {
          .about-page {
            padding: 5rem 0 3rem;
          }
          .about-header {
            margin-bottom: 2.5rem;
          }
          .about-subtitle {
            font-size: 1rem;
            line-height: 1.6;
          }
          .about-cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
          }
          .about-card {
            padding: 1.75rem 1.5rem;
          }
          .about-card h3 {
            font-size: 1.3rem;
          }
          .philosophy-card {
            padding: 1.75rem 1.5rem;
            border-left: none;
            border-top: 4px solid var(--primary-color);
          }
          .philosophy-card h2 {
            font-size: 1.6rem;
            margin-bottom: 1rem;
          }
          .philosophy-quote {
            font-size: 1.05rem;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .philosophy-desc {
            font-size: 0.95rem;
            line-height: 1.6;
          }
          .profile-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .profile-bio {
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default About;