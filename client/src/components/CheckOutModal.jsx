import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Clock, MapPin, AlertCircle, Receipt } from 'lucide-react';

export default function CheckOutModal({ isOpen, onClose, onSuccess, initialTicketId, floors }) {
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Collect all active tickets from floors
  const activeTickets = (floors || []).flatMap(f => (f.spots || []).filter(s => s.is_occupied === 1 && s.ticket_id)).map(s => ({
    ticket_id: s.ticket_id,
    license_plate: s.license_plate,
    spot_number: s.spot_number,
    vehicle_type: s.vehicle_type,
    check_in_time: s.check_in_time
  }));

  useEffect(() => {
    if (initialTicketId) {
      setSelectedTicketId(initialTicketId.toString());
    } else if (activeTickets.length > 0) {
      setSelectedTicketId(activeTickets[0].ticket_id.toString());
    } else {
      setSelectedTicketId('');
    }
  }, [isOpen, initialTicketId]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Check-out failed');
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Receipt size={24} color="#10b981" /> Check-Out & Fee Receipt
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          Process payment calculation according to tiered rates ($10 1st hr, $5 extra hr, $40 daily cap).
        </p>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fda4af', marginBottom: '16px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {activeTickets.length > 0 ? (
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Select Parked Vehicle</label>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="input-field mono-font"
              >
                {activeTickets.map(t => (
                  <option key={t.ticket_id} value={t.ticket_id}>
                    🚗 {t.license_plate} (Spot {t.spot_number} - {t.vehicle_type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-glow)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Billing Calculation Rules
              </div>
              <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>1st Hour Base Rate: <strong>$10.00</strong></li>
                <li>Each Extra Hour: <strong>$5.00 / hr</strong></li>
                <li>Daily Cap (Max per 24-hr cycle): <strong>$40.00</strong></li>
                <li>Part-hours round up to next full hour</li>
              </ul>
            </div>

            <button type="submit" className="btn-success" style={{ justifyContent: 'center', padding: '12px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Processing Payment...' : 'Confirm Check-Out & Release Spot'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
            No active parked vehicles available for check-out.
          </div>
        )}
      </div>
    </div>
  );
}
