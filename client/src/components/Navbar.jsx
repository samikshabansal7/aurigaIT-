import React from 'react';
import { ShieldCheck, Car, Search, ListFilter, Zap, LogIn, LogOut, LayoutDashboard, Home } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user, onOpenAuth, onLogout, evFreeCount }) {
  return (
    <nav className="glass-panel" style={{ margin: '16px 24px', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentTab('landing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
        }}>
          <Car size={24} color="#ffffff" />
        </div>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ParkPulse
          </h2>
          <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.04em' }}>
            GARAGE ATTENDANT SYSTEM
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setCurrentTab('landing')}
          className={currentTab === 'landing' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          <Home size={16} /> Product Landing
        </button>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className={currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.88rem', position: 'relative' }}
        >
          <LayoutDashboard size={16} /> Live Floor Map
          {evFreeCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}></span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('search')}
          className={currentTab === 'search' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          <Search size={16} /> Plate Hunt
        </button>

        <button
          onClick={() => setCurrentTab('logs')}
          className={currentTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          <ListFilter size={16} /> Transaction Audit Logs
        </button>
      </div>

      {/* User Auth Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> {user.role}
              </div>
            </div>
            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 12px' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-success" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            <LogIn size={16} /> Attendant Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
