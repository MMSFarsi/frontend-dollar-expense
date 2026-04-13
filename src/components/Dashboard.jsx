import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock, List as ListIcon } from 'lucide-react';
import TransactionList from './TransactionList';

const Dashboard = ({ balance, income, expense, recentTransactions = [], onNavigate, onDelete }) => {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-grid">
        <div className="card balance animate-enter" style={{animationDelay: '0.1s'}}>
          <Wallet size={40} color="var(--secondary)" style={{marginBottom: '1rem'}} />
          <div className="card-title">Remaining Balance</div>
          <div className="card-value">${balance.toFixed(2)}</div>
        </div>
        
        <div className="card income animate-enter" style={{animationDelay: '0.2s'}}>
          <TrendingUp size={40} color="var(--income)" style={{marginBottom: '1rem'}} />
          <div className="card-title">Total Dollar Purchased</div>
          <div className="card-value">${income.toFixed(2)}</div>
        </div>
        
        <div className="card expense animate-enter" style={{animationDelay: '0.3s'}}>
          <TrendingDown size={40} color="var(--expense)" style={{marginBottom: '1rem'}} />
          <div className="card-title">Total Expenses</div>
          <div className="card-value">${expense.toFixed(2)}</div>
        </div>
      </div>

      <div className="recent-transactions animate-enter" style={{ marginTop: '3rem', animationDelay: '0.4s' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          <Clock size={24} /> Recent Transactions
        </h3>
        <TransactionList transactions={recentTransactions} hideFilter={true} onDelete={onDelete} />
        {recentTransactions.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn" onClick={() => onNavigate && onNavigate('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem', width: 'auto' }}>
              <ListIcon size={18} /> View All Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
