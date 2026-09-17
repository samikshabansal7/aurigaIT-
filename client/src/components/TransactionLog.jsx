import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Download, Filter, RefreshCw, Zap } from 'lucide-react';

export default function TransactionLog({ onCheckOut }) {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [sortBy, setSortBy] = useState('check_in_time');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status,
        vehicle_type: vehicleType,
        sortBy,
        sortOrder
      });

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, status, vehicleType, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const exportCSV = () => {
    if (!tickets || tickets.length === 0) return;
    const headers = ['ID', 'License Plate', 'Vehicle Type', 'Spot', 'Floor', 'Check-In', 'Check-Out', 'Status', 'Fee ($)'];
    const rows = tickets.map(t => [
      t.id,
      t.license_plate,
      t.vehicle_type,
      t.spot_number,
      t.floor_name,
      t.check_in_time,
      t.check_out_time || 'ACTIVE',
      t.status,
      t.status === 'completed' ? t.total_fee : t.currentAccruedFee
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ParkPulse_Audit_Log_Page_${pagination.page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '0 24px 60px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Transaction Audit Logs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Complete evening transaction record with server-side pagination, sorting, and export capabilities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchLogs} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-primary">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="input-field mono-font"
            placeholder="Search license plate or spot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            <Search size={16} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Filter Status:
          </span>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="input-field" 
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Parked</option>
            <option value="completed">Completed Check-Out</option>
          </select>

          <select 
            value={vehicleType} 
            onChange={(e) => { setVehicleType(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="input-field" 
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="all">All Vehicle Types</option>
            <option value="ev">EV Charging</option>
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('license_plate')}>
                  License Plate <ArrowUpDown size={14} />
                </th>
                <th>Type</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('spot_number')}>
                  Spot / Floor <ArrowUpDown size={14} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('check_in_time')}>
                  Check-In Time <ArrowUpDown size={14} />
                </th>
                <th>Check-Out Time</th>
                <th>Status</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('total_fee')}>
                  Total Fee ($) <ArrowUpDown size={14} />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading audit records...
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => {
                  const isActive = t.status === 'active';
                  return (
                    <tr key={t.id}>
                      <td className="mono-font" style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                        {t.license_plate}
                      </td>
                      <td>
                        <span className={`badge badge-${t.vehicle_type}`}>
                          {t.vehicle_type === 'ev' && <Zap size={12} />}
                          {t.vehicle_type}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#3b82f6' }}>{t.spot_number}</strong> ({t.floor_name})
                      </td>
                      <td>{new Date(t.check_in_time).toLocaleString()}</td>
                      <td>{t.check_out_time ? new Date(t.check_out_time).toLocaleString() : '—'}</td>
                      <td>
                        {isActive ? (
                          <span className="badge badge-occupied">ACTIVE</span>
                        ) : (
                          <span className="badge badge-available">COMPLETED</span>
                        )}
                      </td>
                      <td className="mono-font" style={{ fontWeight: 700, color: isActive ? '#10b981' : '#f8fafc' }}>
                        ${isActive ? `${t.currentAccruedFee}.00 (accrued)` : `${t.total_fee}.00`}
                      </td>
                      <td>
                        {isActive ? (
                          <button onClick={() => onCheckOut(t.id)} className="btn-success" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            Check-Out
                          </button>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No audit logs match current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
        <div>
          Showing {tickets.length} of {pagination.total} total transactions
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="btn-secondary"
            style={{ padding: '6px 12px', opacity: pagination.page === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong></span>

          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary"
            style={{ padding: '6px 12px', opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
