import React, { useState } from 'react';
import { Car, Zap, ShieldCheck, DollarSign, Search, Clock, Cpu, ArrowRight, CheckCircle2, Sparkles, Layers, Layers3, Activity } from 'lucide-react';

export default function LandingPage({ onGoToConsole }) {
  // Interactive ROI Calculator State
  const [dailyCars, setDailyCars] = useState(120);
  const [avgStayHours, setAvgStayHours] = useState(4);
  const [evRatio, setEvRatio] = useState(25);

  // Math for ROI calculation
  // Base rates: $10 1st hr, $5 extra hr, $40 daily cap
  const calculateDailyRevenue = () => {
    const hours = Math.ceil(avgStayHours);
    let feePerCar = 0;
    if (hours === 1) feePerCar = 10;
    else feePerCar = 10 + (hours - 1) * 5;
    feePerCar = Math.min(feePerCar, 40);

    const projectedDaily = dailyCars * feePerCar;
    const projectedMonthly = projectedDaily * 30;
    return { feePerCar, projectedDaily, projectedMonthly };
  };

  const revenue = calculateDailyRevenue();

  return (
    <div style={{ padding: '0 24px 60px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section className="glass-panel" style={{ padding: '60px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
          <Sparkles size={16} /> ROUND 2 RECRUITMENT BUILDER DEMO
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ParkPulse — Smart Multi-Level <br /> Garage Attendant Platform
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 36px auto', fontWeight: 400 }}>
          Eliminate double-parking, streamline EV charging spot allocations, and automate tiered billing with zero manual fee calculation errors. Built specifically for high-volume city-centre garages.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={onGoToConsole} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Launch Attendant Console <ArrowRight size={18} />
          </button>
          <a href="#roi-calculator" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem', textDecoration: 'none' }}>
            Explore Revenue Engine
          </a>
        </div>
      </section>

      {/* Product Overview: What it is & How it helps */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '20px' }}>
            <Car size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px', fontWeight: 700 }}>What is ParkPulse?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            ParkPulse is an end-to-end multi-level garage management tool that replaces chaotic paper logs with real-time floor map tracking, constraint-aware spot reservation, and automated checkout fee processing.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '20px' }}>
            <Zap size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px', fontWeight: 700 }}>How It Helps Garage Attendants</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            By evening, when hundreds of cars have entered and exited, attendants can instantly answer driver inquiries ("Is an EV spot free right now?"), locate any vehicle by license plate in seconds, and charge exact rates with zero disputes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '20px' }}>
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px', fontWeight: 700 }}>Target Audience & Users</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Designed for city garage attendants, municipal parking operators, commercial building managers, and EV fleet coordinators who require multi-floor oversight and strict spot type compliance.
          </p>
        </div>
      </section>

      {/* Key Features Breakdown */}
      <section className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '32px', fontWeight: 700 }}>
          Core Key Features
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <DollarSign size={24} color="#10b981" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Tiered Fee Engine & Daily Cap</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              $10 for 1st hour, $5 for each subsequent hour, with a $40 max daily cap per 24 hours. Automatic ceiling rounding for part-hours.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Zap size={24} color="#3b82f6" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Strict Spot Constraints (EV Charging)</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Enforces mandatory EV-to-EV charger spot matching. Prevents double-parking and misallocation of EV charging bays.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Search size={24} color="#8b5cf6" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Instant License Plate Hunt</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Quick search box allowing attendants to search any vehicle plate instantly, retrieving floor number, spot ID, check-in time, and accrued fee.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Clock size={24} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Paginated Evening Audit Log</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Server-side paginated transaction log supporting sorting by check-in time, license plate, or fee, alongside status filtering.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Revenue & ROI Calculator */}
      <section id="roi-calculator" className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '12px', fontWeight: 700 }}>
          Interactive Garage Revenue Calculator
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px' }}>
          Simulate daily and monthly revenue under ParkPulse's automated tiered fee structure.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: '#94a3b8' }}>
                <span>Daily Vehicles Check-In:</span>
                <strong style={{ color: '#f8fafc' }}>{dailyCars} cars</strong>
              </label>
              <input 
                type="range" min="10" max="500" value={dailyCars} 
                onChange={(e) => setDailyCars(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: '#94a3b8' }}>
                <span>Average Stay Duration:</span>
                <strong style={{ color: '#f8fafc' }}>{avgStayHours} hours</strong>
              </label>
              <input 
                type="range" min="1" max="24" value={avgStayHours} 
                onChange={(e) => setAvgStayHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-glow)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Calculated Fee Per Car
            </div>
            <div className="mono-font" style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: '16px' }}>
              ${revenue.feePerCar}.00
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Projected Daily</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>${revenue.projectedDaily.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Projected Monthly</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8b5cf6' }}>${revenue.projectedMonthly.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Section: 3 Features We Would Build Next */}
      <section className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
          <Cpu size={18} /> Product Roadmap & Future Vision
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', fontWeight: 700 }}>
          3 Features We Would Build Next
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa', marginBottom: '10px' }}>
              <CheckCircle2 size={20} /> 1. Automatic License Plate Recognition (ALPR)
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Integrate camera streams at entry and exit barriers with AI computer vision models (e.g. YOLOv8 / OpenALPR) to automatically check in and check out vehicles without manual attendant key-in.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
              <CheckCircle2 size={20} /> 2. Dynamic Surge Pricing & Predictive Occupancy
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Use historical peak-hour data and event calendars to dynamically adjust hourly base rates during peak demand, maximizing revenue while guaranteeing reserve spots for EV charging.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#c084fc', marginBottom: '10px' }}>
              <CheckCircle2 size={20} /> 3. Mobile Driver App & EV Charger Pre-Booking
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Enable drivers to check live EV spot availability before arriving at the garage, pre-reserve a charger slot with a 15-minute hold, and pay via mobile wallet / QR code scanning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
