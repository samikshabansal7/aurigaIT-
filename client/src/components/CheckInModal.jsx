import React, { useState, useEffect } from 'react';
import { X, Car, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CheckInModal({ isOpen, onClose, onSuccess, initialSpotId, initialVehicleType, floors }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('compact');
  const [preferredSpotId, setPreferredSpotId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialVehicleType) setVehicleType(initialVehicleType);
    if (initialSpotId) setPreferredSpotId(initialSpotId.toString());
    else setPreferredSpotId('');
    setError('');
  }, [isOpen, initialSpotId, initialVehicleType]);

  if (!isOpen) return null;

  // Flatten available spots across floors
  const availableSpots = (floors || []).flatMap(f => (f.spots || []).filter(s => s.is_occupied === 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!licensePlate.trim()) {
      setError('Please enter a license plate number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tickets/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_plate: licensePlate.trim(),
          vehicle_type: vehicleType,
          preferred_spot_id: preferredSpotId ? parseInt(preferredSpotId) : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      onSuccess(data.ticket);
      onClose();
      setLicensePlate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Car size={24} color="#3b82f6" /> Vehicle Check-In
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          Assign a parking spot and generate a timestamped entry ticket.
        </p>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fda4af', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>License Plate Number *</label>
            <input 
              type="text" 
              className="input-field mono-font" 
              placeholder="e.g. MH-12-AB-1234, TESLA-99" 
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              required
              style={{ fontSize: '1.1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Vehicle Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setVehicleType('compact')}
                className={`badge badge-compact`}
                style={{
                  padding: '12px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: vehicleType === 'compact' ? '2px solid #3b82f6' : '1px solid var(--border-color)'
                }}
              >
                Compact
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('standard')}
                className={`badge badge-standard`}
                style={{
                  padding: '12px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: vehicleType === 'standard' ? '2px solid #8b5cf6' : '1px solid var(--border-color)'
                }}
              >
                Standard
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('ev')}
                className={`badge badge-ev`}
                style={{
                  padding: '12px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: vehicleType === 'ev' ? '2px solid #10b981' : '1px solid var(--border-color)'
                }}
              >
                <Zap size={14} /> EV (Electric)
              </button>
            </div>
          </div>

          {vehicleType === 'ev' && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} /> <strong>Rule Enforced:</strong> EV vehicles MUST be allocated an EV spot equipped with a charger.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Spot Selection (Optional)</label>
            <select
              value={preferredSpotId}
              onChange={(e) => setPreferredSpotId(e.target.value)}
              className="input-field"
            >
              <option value="">⚡ Auto-assign best available spot</option>
              {availableSpots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  Spot {spot.spot_number} ({spot.spot_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }} disabled={loading}>
            {loading ? 'Processing Check-In...' : 'Confirm Check-In'}
          </button>
        </form>
      </div>
    </div>
  );
}
