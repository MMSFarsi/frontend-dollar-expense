import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock, List as ListIcon, FileText, AlertTriangle, Settings } from 'lucide-react';
import TransactionList from './TransactionList';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Dashboard = ({ balance, income, expense, recentTransactions = [], onNavigate, onDelete, allFilteredTransactions = [], isLoading = false }) => {
  // Aggregate data by date
  const chartDataMap = {};
  allFilteredTransactions.forEach(t => {
    // Format "Apr 1"
    const dateStr = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!chartDataMap[dateStr]) {
      chartDataMap[dateStr] = { name: dateStr, Income: 0, Expense: 0, sortDate: new Date(t.date) };
    }
    if (t.type === 'income') {
      chartDataMap[dateStr].Income += t.amount;
    } else {
      chartDataMap[dateStr].Expense += t.amount;
    }
  });

  // Sort logically from oldest date (left) to newest date (right)
  const chartData = Object.values(chartDataMap).sort((a, b) => a.sortDate - b.sortDate);

  // 3D Tilt handlers
  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -12;
    const rotateY = ((x - rect.width  / 2) / rect.width)  *  12;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
  };
  const resetTilt = (e) => {
    e.currentTarget.style.transform = '';
  };

  // Low Balance Alert
  const [threshold, setThreshold] = useState(() => parseFloat(localStorage.getItem('balanceThreshold') || '15'));
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(threshold);
  const isLowBalance = !isLoading && balance < threshold;

  const saveThreshold = () => {
    const val = parseFloat(tempThreshold);
    if (!isNaN(val) && val >= 0) {
      setThreshold(val);
      localStorage.setItem('balanceThreshold', val);
    }
    setEditingThreshold(false);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('dashboard-pdf-root');
    if (!element) return;
    
    // Slight delay to ensure charts are firmly rendered if this was heavily dynamic
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#F8F9FA' });
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate portrait A4 layout fit
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Kidsland_Report_${new Date().toLocaleDateString().replace(/\//g,'-')}.pdf`);
    } catch (error) {
      console.error("Failed generating PDF:", error);
      alert("Could not generate PDF right now.");
    }
  };

  return (
    <div className="dashboard-wrapper">

      {/* Low Balance Alert Banner */}
      {isLowBalance && (
        <div className="low-balance-alert">
          <AlertTriangle size={20} />
          ⚠️ Low Balance Warning! Your balance of <strong>${balance.toFixed(2)}</strong> is below your alert threshold of <strong>${threshold.toFixed(2)}</strong>.
        </div>
      )}

      {/* Threshold configurator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '10px' }}>
        {editingThreshold ? (
          <>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Alert me below $</span>
            <input
              type="number"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              style={{ width: '80px', padding: '0.3rem 0.5rem', borderRadius: '8px', border: '2px solid var(--primary)', outline: 'none', background: 'var(--card-bg)', color: 'var(--text-dark)', fontWeight: 'bold' }}
              autoFocus
            />
            <button onClick={saveThreshold} style={{ background: 'var(--income)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
            <button onClick={() => setEditingThreshold(false)} style={{ background: 'var(--expense)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>✕</button>
          </>
        ) : (
          <button
            onClick={() => { setTempThreshold(threshold); setEditingThreshold(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '2px solid var(--input-border)', borderRadius: '100px', padding: '0.3rem 0.8rem', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}
          >
            <Settings size={14} /> Alert Threshold: ${threshold.toFixed(2)}
          </button>
        )}
      </div>

      <div id="dashboard-pdf-root" style={{ padding: '10px' }}>
        <div className="dashboard-grid">
          {isLoading ? (
            <>
              <div className="card skeleton" style={{ height: '160px' }}></div>
              <div className="card skeleton" style={{ height: '160px', animationDelay: '0.1s' }}></div>
              <div className="card skeleton" style={{ height: '160px', animationDelay: '0.2s' }}></div>
            </>
          ) : (
            <>
              <div className="card balance animate-enter" style={{animationDelay: '0.1s'}} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <Wallet size={40} color="var(--secondary)" style={{marginBottom: '1rem'}} />
                <div className="card-title">Remaining Balance</div>
                <div className="card-value">${balance.toFixed(2)}</div>
              </div>
              
              <div className="card income animate-enter" style={{animationDelay: '0.2s'}} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <TrendingUp size={40} color="var(--income)" style={{marginBottom: '1rem'}} />
                <div className="card-title">Total Dollar Purchased</div>
                <div className="card-value">${income.toFixed(2)}</div>
              </div>
              
              <div className="card expense animate-enter" style={{animationDelay: '0.3s'}} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <TrendingDown size={40} color="var(--expense)" style={{marginBottom: '1rem'}} />
                <div className="card-title">Total Expenses</div>
                <div className="card-value">${expense.toFixed(2)}</div>
              </div>
            </>
          )}
        </div>

      <div className="chart-container animate-enter" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--box-shadow)', marginTop: '2rem', animationDelay: '0.35s' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Income & Expense Trends</h3>
          <button className="btn" onClick={handleDownloadPdf} style={{ width: 'auto', padding: '0.5rem 1.2rem', fontSize: '0.85rem', backgroundColor: 'var(--text-dark)', color: 'var(--bg-color)', gap: '6px' }}>
            <FileText size={16} /> Download PDF Report
          </button>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          {isLoading ? (
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>
          ) : chartData.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', paddingTop: '4rem' }}>No data available for this timeframe.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-light)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-light)'}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Expense" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="recent-transactions animate-enter" style={{ marginTop: '3rem', animationDelay: '0.4s' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          <Clock size={24} /> Recent Transactions
        </h3>
        <TransactionList transactions={recentTransactions} hideFilter={true} onDelete={onDelete} isLoading={isLoading} />
        {recentTransactions.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn" onClick={() => onNavigate && onNavigate('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem', width: 'auto' }}>
              <ListIcon size={18} /> View All Records
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
