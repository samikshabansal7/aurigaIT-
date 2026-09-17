import React, { useState } from 'react';
import { Car, Zap, CheckCircle2, XCircle, PlusCircle, MinusCircle, RefreshCw, MapPin, AlertTriangle, Layers } from 'lucide-react';

export default function Dashboard({
  overview,
  floors,
  onRefresh,
  onOpenCheckIn,
  onOpenCheckOut,
  onSelectSpot
}) {
  const [selectedFloorId, setSelectedFloorId] = useState(null);

  if (!overview) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px auto' }} />
        <p>Loading Garage Live Status...</p>
      </div>
    );
  }

  const { stats, garage } = overview;
  const currentFloors = floors || [];
  
  // Set default selected floor if not set
  const activeFloor = currentFloors.find(f => f.id === selectedFloorId) || currentFloors[0] || null;

  const occupancyPercent = stats.totalCapacity > 0 
    ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100) 
    : 0;

  return (
    <div style={{ padding: '0 24px 60px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {garage.name} — Live Floor Map
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Real-time occupancy tracking, EV charger management, and quick check-in / check-out actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onRefresh} className="btn-secondary" title="Refresh Live Data">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => onOpenCheckIn()} className="btn-primary">
            <PlusCircle size={18} /> Check-In Car
          </button>
          <button onClick={() => onOpenCheckOut()} className="btn-success">
            <MinusCircle size={18} /> Check-Out & Charge
          </button>
        </div>
      </div>

      {/* EV Spot Free Right Now Banner (Specific Storyline Requirement) */}
      <div 
        className="glass-panel"
        style={{
          padding: '18px 24px',
          marginBottom: '24px',
          background: stats.ev.isEvFree 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' 
            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: stats.ev.isEvFree ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: stats.ev.isEvFree ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: stats.ev.isEvFree ? '#34d399' : '#f43f5e'
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Driver Inquiry Status
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Is an EV Spot free right now?</span>
              {stats.ev.isEvFree ? (
                <span className="badge badge-available">
                  <CheckCircle2 size={14} /> YES — {stats.ev.free} Available ({stats.ev.total} Total)
                </span>
              ) : (
                <span className="badge badge-occupied">
                  <XCircle size={14} /> NO — ALL {stats.ev.total} EV SPOTS OCCUPIED
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <button 
            onClick={() => onOpenCheckIn(null, 'ev')} 
            disabled={!stats.ev.isEvFree}
            className="btn-success"
            style={{ opacity: stats.ev.isEvFree ? 1 : 0.5, cursor: stats.ev.isEvFree ? 'pointer' : 'not-allowed' }}
          >
            <Zap size={16} /> Quick EV Check-In
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
            TOTAL OCCUPANCY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="mono-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>
              {stats.totalOccupied} / {stats.totalCapacity}
            </span>
            <span style={{ fontSize: '0.9rem', color: occupancyPercent > 80 ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
              {occupancyPercent}% Full
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
            EV CHARGING SPOTS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="mono-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {stats.ev.free} Free
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              of {stats.ev.total} total
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
            COMPACT SPOTS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="mono-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
              {stats.compact.free} Free
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              of {stats.compact.total} total
            </span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
            TIERED PRICING RATES
          </div>
          <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600 }}>
            1st hr: <span style={{ color: '#10b981' }}>${garage.rates.hourlyFirstRate}</span> | Next: <span style={{ color: '#3b82f6' }}>${garage.rates.hourlyNextRate}/h</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Daily Cap: <span style={{ color: '#8b5cf6', fontWeight: 600 }}>${garage.rates.dailyCapRate} max/24h</span>
          </div>
        </div>
      </div>

      {/* Floor Selection Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} /> Select Floor:
        </span>
        {currentFloors.map((floor) => {
          const isActive = activeFloor && activeFloor.id === floor.id;
          return (
            <button
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              {floor.name}
            </button>
          );
        })}
      </div>

      {/* Floor Plan Spot Grid */}
      {activeFloor ? (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {activeFloor.name} — Spot Map Grid
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }}></span> EV Charger
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }}></span> Compact
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a78bfa' }}></span> Standard
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {activeFloor.spots && activeFloor.spots.length > 0 ? (
              activeFloor.spots.map((spot) => {
                const isOccupied = spot.is_occupied === 1;

                let badgeClass = 'badge-standard';
                if (spot.spot_type === 'ev') badgeClass = 'badge-ev';
                else if (spot.spot_type === 'compact') badgeClass = 'badge-compact';

                return (
                  <div
                    key={spot.id}
                    className={`spot-card ${isOccupied ? 'occupied' : 'available'}`}
                    onClick={() => {
                      if (isOccupied) {
                        onOpenCheckOut(spot.ticket_id);
                      } else {
                        onOpenCheckIn(spot.id, spot.spot_type);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="mono-font" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                        {spot.spot_number}
                      </span>
                      <span className={`badge ${badgeClass}`}>
                        {spot.spot_type === 'ev' && <Zap size={12} />}
                        {spot.spot_type}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div>
                        <div className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f43f5e', marginBottom: '4px' }}>
                          🚗 {spot.license_plate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Type: <span style={{ textTransform: 'uppercase', color: '#cbd5e1' }}>{spot.vehicle_type}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                          Click to Check-Out
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '12px' }}>
                        <span className="badge badge-available">VACANT</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px' }}>
                          Click to Park Here
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', padding: '20px' }}>No spots registered on this floor.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          No floor data available.
        </div>
      )}
    </div>
  );
}
