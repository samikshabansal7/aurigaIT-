import React, { useState } from 'react';
import { Search, Car, MapPin, Clock, DollarSign, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function PlateHunt({ onCheckOut }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tickets/search?plate=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search license plate');
      }

      setResults(data.tickets || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 24px 60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '28px', textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', margin: '0 auto 16px auto' }}>
          <Search size={28} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          License Plate Quick Hunt
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Instantly locate any parked car by entering full or partial license plate numbers. View floor location, spot type, check-in duration, and live fee preview.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            className="input-field mono-font"
            placeholder="e.g. TESLA-EV1, MINI-789, FORD"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 24px' }} disabled={loading}>
            {loading ? 'Searching...' : 'Hunt Car'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fda4af', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Results Display */}
      {results !== null && (
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#cbd5e1' }}>
            Found {results.length} matching result(s)
          </h3>

          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((ticket) => {
                const isActive = ticket.status === 'active';

                return (
                  <div key={ticket.id} className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#3b82f6' : '#94a3b8'
                      }}>
                        <Car size={30} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span className="mono-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                            {ticket.license_plate}
                          </span>
                          <span className={`badge badge-${ticket.vehicle_type}`}>
                            {ticket.vehicle_type === 'ev' && <Zap size={12} />}
                            {ticket.vehicle_type}
                          </span>
                          {isActive ? (
                            <span className="badge badge-occupied">PARKED NOW</span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1' }}>COMPLETED</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={15} color="#3b82f6" /> Spot <strong style={{ color: '#f8fafc' }}>{ticket.spot_number}</strong> ({ticket.floor_name})
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={15} color="#10b981" /> In: {new Date(ticket.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Accrued Fee</div>
                          <div className="mono-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                            ${ticket.currentAccruedFee}.00
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            ({ticket.currentBilledHours} hr billed)
                          </div>
                        </div>

                        <button onClick={() => onCheckOut(ticket.id)} className="btn-success">
                          Check-Out Car
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Final Charged Fee</div>
                        <div className="mono-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8' }}>
                          ${ticket.total_fee}.00
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No parked vehicle found matching "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
