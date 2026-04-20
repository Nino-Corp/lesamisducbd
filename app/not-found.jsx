import Link from 'next/link';

export const metadata = {
  title: 'Page introuvable | Les Amis du CBD',
  description: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 250px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
    }}>
      <style>{`
        .not-found-heading {
          font-size: clamp(5rem, 12vw, 8rem);
          font-weight: 900;
          color: #1F4B40;
          margin: 0 0 0.5rem 0;
          line-height: 1;
          letter-spacing: -2px;
        }
        .not-found-subheading {
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 1.5rem 0;
        }
        .not-found-text {
          color: #555;
          font-size: 1.15rem;
          line-height: 1.7;
          max-width: 550px;
          margin: 0 auto 3rem auto;
        }
        .btn-home {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #1F4B40;
          color: #fff;
          padding: 16px 36px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(31, 75, 64, 0.2);
        }
        .btn-home:hover {
          background-color: #14352c;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(31, 75, 64, 0.3);
        }
      `}</style>
      
      <div style={{
        position: 'relative',
        display: 'inline-block',
        marginBottom: '2rem'
      }}>
        {/* Subtle decorative background circle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          backgroundColor: 'rgba(31, 75, 64, 0.05)',
          borderRadius: '50%',
          zIndex: -1
        }}></div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1F4B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="9" y1="9" x2="13" y2="13"></line>
          <line x1="13" y1="9" x2="9" y2="13"></line>
        </svg>
      </div>

      <h1 className="not-found-heading">404</h1>
      <h2 className="not-found-subheading">Oups ! Page introuvable</h2>
      <p className="not-found-text">
        Désolé, la page que vous recherchez semble avoir disparu ou bien le lien est cassé. Pas de panique, revenons à l'essentiel !
      </p>
      
      <Link href="/" className="btn-home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Retour à la boutique
      </Link>
    </div>
  );
}
