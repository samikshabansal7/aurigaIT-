import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import PlateHunt from './components/PlateHunt.jsx';
import TransactionLog from './components/TransactionLog.jsx';

import AuthModal from './components/AuthModal.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import CheckOutModal from './components/CheckOutModal.jsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing'); // 'landing', 'dashboard', 'search', 'logs'
  const [user, setUser] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [floors, setFloors] = useState([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const [preselectedSpotId, setPreselectedSpotId] = useState(null);
  const [preselectedVehicleType, setPreselectedVehicleType] = useState(null);
  const [preselectedTicketId, setPreselectedTicketId] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchGarageData = async () => {
    try {
      const [overviewRes, floorsRes] = await Promise.all([
        fetch('/api/garage/overview'),
        fetch('/api/garage/floors')
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      }
      if (floorsRes.ok) {
        const data = await floorsRes.json();
        setFloors(data.floors || []);
      }
    } catch (err) {
      console.error('Error fetching garage status:', err);
    }
  };

  const checkUserSession = async () => {
    const token = localStorage.getItem('parkpulse_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('parkpulse_token');
      }
    } catch (err) {
      console.error('Auth session error:', err);
    }
  };

  useEffect(() => {
    fetchGarageData();
    checkUserSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('parkpulse_token');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const handleOpenCheckIn = (spotId = null, vehicleType = null) => {
    setPreselectedSpotId(spotId);
    setPreselectedVehicleType(vehicleType);
    setIsCheckInOpen(true);
  };

  const handleOpenCheckOut = (ticketId = null) => {
    setPreselectedTicketId(ticketId);
    setIsCheckOutOpen(true);
  };

  const handleCheckInSuccess = (ticket) => {
    showToast(`Checked in car ${ticket.license_plate} to Spot ${ticket.spot_number}!`, 'success');
    fetchGarageData();
  };

  const handleCheckOutSuccess = (data) => {
    const fee = data.feeBreakdown.totalFee;
    showToast(`Check-out complete! Total charged: $${fee}.00`, 'success');
    fetchGarageData();
  };

  const evFreeCount = overview?.stats?.ev?.free || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 24px',
          borderRadius: '12px',
          background: toast.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        evFreeCount={evFreeCount}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentTab === 'landing' && (
          <LandingPage onGoToConsole={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            overview={overview}
            floors={floors}
            onRefresh={fetchGarageData}
            onOpenCheckIn={handleOpenCheckIn}
            onOpenCheckOut={handleOpenCheckOut}
          />
        )}

        {currentTab === 'search' && (
          <PlateHunt onCheckOut={handleOpenCheckOut} />
        )}

        {currentTab === 'logs' && (
          <TransactionLog onCheckOut={handleOpenCheckOut} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        ParkPulse &copy; 2026 — Campus Recruitment Round 2 Builder Challenge. Built with Node.js, Express, SQLite, React & Vite.
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          showToast(`Welcome back, ${userData.username}!`);
        }}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
        initialSpotId={preselectedSpotId}
        initialVehicleType={preselectedVehicleType}
        floors={floors}
      />

      <CheckOutModal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        onSuccess={handleCheckOutSuccess}
        initialTicketId={preselectedTicketId}
        floors={floors}
      />
    </div>
  );
}
