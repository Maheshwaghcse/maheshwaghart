import React from 'react';

const Footer = () => {

  return (
    <footer style={{
      backgroundColor: 'var(--bg-black)',
      color: 'var(--text-white)',
      padding: '8rem 0 4rem 0',
      borderTop: '1px solid var(--border-color)',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
      transition: 'background-color 0.4s ease'
    }}>
      <style>{`
        .footer-brand-title {
          font-size: clamp(2.5rem, 6vw, 6rem);
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
          display: inline-block;
          cursor: default;
          transition: all 0.4s ease;
          /* Default: muted outline text */
          color: transparent;
          -webkit-text-stroke: 2px rgba(200, 180, 210, 0.4);
        }
        .footer-brand-title:hover {
          /* On hover: vivid gradient fill */
          -webkit-text-stroke: 0px transparent;
          background: linear-gradient(90deg, #bd00ff, #ff36c8, #ff8c00, #bd00ff);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: footerTitleGradient 2s linear infinite;
          filter: drop-shadow(0 0 20px rgba(189, 0, 255, 0.5));
        }
        @keyframes footerTitleGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .follow-label {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 6px;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          display: block;
          text-transform: uppercase;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 6rem;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-links-list {
            align-items: center;
          }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-links-list {
            align-items: center;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem !important;
            padding-top: 3rem !important;
          }
          .footer-follow-section {
            margin-bottom: 4rem !important;
            padding-bottom: 3rem !important;
          }
          .footer-follow-desc {
            font-size: 1rem !important;
            margin-bottom: 2rem !important;
          }
          .footer-social-links {
            gap: 1rem !important;
          }
          .footer-social-btn {
            padding: 0.75rem 1.5rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
      <div className="container">
        {/* Dedicated Follow Me Section */}
        <div className="footer-follow-section" style={{ textAlign: 'center', marginBottom: '8rem', paddingBottom: '6rem', borderBottom: '1px solid var(--border-color)' }}>
          <span className="follow-label">FOLLOW</span>
          <h2 className="footer-brand-title">
            MAHESHWAGH_ART
          </h2>
          <p className="footer-follow-desc" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            If you want to watch something being built from nothing — that's what's over there.
          </p>

          <div className="footer-social-links" style={{ display: 'flex', gap: '2rem', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/maheshwagh_art" target="_blank" rel="noreferrer" className="btn btn-outline footer-social-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', padding: '1rem 2rem' }}>
              <InstagramSVG /> Instagram
            </a>
            <a href="https://youtube.com/@maheshwagh_art?si=dY8JbfwyVkBuAulH" target="_blank" rel="noreferrer" className="btn btn-outline footer-social-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', padding: '1rem 2rem' }}>
              <YoutubeSVG /> YouTube
            </a>
            <a href="https://www.pinterest.com/maheshwagh_art/" target="_blank" rel="noreferrer" className="btn btn-outline footer-social-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', padding: '1rem 2rem' }}>
              <PinterestSVG /> Pinterest
            </a>
            <a href="https://www.facebook.com/maheshwagh03" target="_blank" rel="noreferrer" className="btn btn-outline footer-social-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', padding: '1rem 2rem' }}>
              <FacebookSVG /> Facebook
            </a>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem' }}>MAHESHWAGH<span className="text-gradient">_ART</span></h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '1.1rem', margin: '0 auto' }}>
              Where light meets shadow, and stories find their form. My art breathes life into charcoal and graphite, hand-crafting hyper-realistic legacies that resonate far beyond the paper
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '2rem', color: 'var(--primary-color)' }}>EXPLORE</h4>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="/" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>HOME</a></li>
              <li><a href="/gallery" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>GALLERY</a></li>
              <li><a href="/art-academy" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>ART ACADEMY</a></li>
              <li><a href="/about" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>OUR STORY</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '2rem', color: 'var(--primary-color)' }}>SUPPORT</h4>
            <ul className="footer-links-list" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="/custom-request" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>CUSTOM REQUEST</a></li>
              <li><a href="/cart" style={{ color: 'var(--text-white)', textDecoration: 'none', fontSize: '0.9rem' }}>SHOPPING BAG</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom" style={{
          paddingTop: '4rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: '700'
        }}>
          <p>© {new Date().getFullYear()} maheshwagh_art</p>
          <p>All rights reserved. Designed and Curated with passion.</p>
        </div>
      </div>
    </footer>
  );
};

const InstagramSVG = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const YoutubeSVG = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
const PinterestSVG = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22c.66 0 1.25-.33 1.55-.91l1.45-5.46c.15-.56.45-1.12.75-1.63.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53.3-.51.6-1.02.9-1.53"></path><path d="M12 2C6.48 2 2 6.48 2 12c0 4.23 2.62 7.85 6.36 9.32.11-1.07.21-2.73.44-3.9l.86-3.64s-.22-.44-.22-1.08c0-1.01.59-1.76 1.31-1.76.62 0 .92.47.92 1.03 0 .62-.4 1.56-.6 2.43-.17.72.36 1.3 1.07 1.3 1.28 0 2.27-1.35 2.27-3.3 0-1.73-1.24-2.94-3.02-2.94-2.06 0-3.27 1.54-3.27 3.14 0 .62.24 1.29.54 1.65.06.07.07.13.05.21l-.21.84c-.03.14-.11.17-.26.11-1-.46-1.62-1.92-1.62-3.08 0-2.5 1.82-4.8 5.24-4.8 2.75 0 4.88 1.96 4.88 4.58 0 2.73-1.73 4.96-4.12 4.96-.81 0-1.56-.42-1.83-.92l-.5 1.9c-.18.69-.67 1.55-1 2.08C10.15 21.75 11.05 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path></svg>;
const FacebookSVG = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;

export default Footer;
