import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = ({ balance, income, expense }) => {
  return (
    <div className="dashboard-grid">
      <div className="card balance animate-enter" style={{animationDelay: '0.1s'}}>
        <Wallet size={40} color="var(--secondary)" style={{marginBottom: '1rem'}} />
        <div className="card-title">Total Balance</div>
        <div className="card-value">${balance.toFixed(2)}</div>
      </div>
      
      <div className="card income animate-enter" style={{animationDelay: '0.2s'}}>
        <TrendingUp size={40} color="var(--income)" style={{marginBottom: '1rem'}} />
        <div className="card-title">Total Income</div>
        <div className="card-value">${income.toFixed(2)}</div>
      </div>
      
      <div className="card expense animate-enter" style={{animationDelay: '0.3s'}}>
        <TrendingDown size={40} color="var(--expense)" style={{marginBottom: '1rem'}} />
        <div className="card-title">Total Expenses</div>
        <div className="card-value">${expense.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default Dashboard;
