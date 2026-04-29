'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you would also call an API to clear the session cookie
    router.push('/');
  };

  return (
    <>
      <div className="background-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2" style={{ background: '#10b981', animationDelay: '-2s' }}></div>
      </div>

      <main className="dashboard-container">
        <nav className="glass-nav">
          <div className="logo">MyApp</div>
          <button onClick={handleLogout} className="btn outline-btn logout-btn">
            Logout
          </button>
        </nav>

        <div className="dashboard-content">
          <header className="dashboard-header">
            <h1>Welcome to your Dashboard ✨</h1>
            <p>You have successfully verified your identity with OTP.</p>
          </header>

          <div className="cards-grid">
            <div className="glass-card stat-card">
              <h3>Security Status</h3>
              <p className="stat-value text-green">Verified</p>
            </div>
            <div className="glass-card stat-card">
              <h3>Login Method</h3>
              <p className="stat-value">Phone OTP</p>
            </div>
            <div className="glass-card stat-card">
              <h3>Last Active</h3>
              <p className="stat-value">Just Now</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1000px;
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .glass-nav {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .outline-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 16px;
          width: auto;
          font-size: 14px;
        }

        .outline-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .dashboard-header {
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          min-height: auto;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card h3 {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-main);
        }

        .text-green {
          color: #10b981;
        }
      `}</style>
    </>
  );
}
