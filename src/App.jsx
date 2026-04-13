import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Wallet, LayoutDashboard, List as ListIcon, LogOut, Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalDateFilter, setGlobalDateFilter] = useState('all');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('https://backend-kidsland-dollar.vercel.app/api/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const getFilteredTransactions = () => {
    if (globalDateFilter === 'all') return transactions;
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (globalDateFilter === 'today') {
        return tDate.toDateString() === now.toDateString();
      }
      if (globalDateFilter === 'week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= lastWeek;
      }
      if (globalDateFilter === 'month') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (globalDateFilter === 'year') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleTransactionAdded = () => {
    fetchTransactions();
    setActiveTab('list');
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://backend-kidsland-dollar.vercel.app/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting transaction:", error.response?.data || error.message);
      alert("Failed to delete the transaction. Please try logging in again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    if (activeTab === 'add') setActiveTab('dashboard');
  };

  return (
    <div className="app-container">
      <header className="header animate-enter">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1rem' }}>
          <img src="https://kidsland.com.bd/logo.png" alt="Kidsland Logo" style={{ height: '50px', objectFit: 'contain' }} />
          Kidsland Dollar Report
        </h1>
        <nav className="nav-links">
          <select 
            className="date-filter-select"
            value={globalDateFilter} 
            onChange={(e) => setGlobalDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <LayoutDashboard size={16} style={{marginRight: '6px'}}/> Dashboard
          </a>
          <a href="#" className={activeTab === 'add' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('add'); }}>
            <PlusCircle size={16} style={{marginRight: '6px'}}/> Add Record
          </a>
          <a href="#" className={activeTab === 'list' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('list'); }}>
            <ListIcon size={16} style={{marginRight: '6px'}}/> All Records
          </a>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', color: 'var(--text-dark)' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {isAuthenticated && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--expense)' }}>
              <LogOut size={16} style={{marginRight: '6px'}}/> Logout
            </a>
          )}
        </nav>
      </header>

      <main className="animate-enter" style={{animationDelay: '0.1s'}}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            balance={balance} 
            income={totalIncome} 
            expense={totalExpense} 
            recentTransactions={filteredTransactions.slice(0, 5)} 
            onNavigate={(tab) => setActiveTab(tab)}
            onDelete={isAuthenticated ? handleDeleteTransaction : null}
            allFilteredTransactions={filteredTransactions}
          />
        )}

        {activeTab === 'add' && (
          isAuthenticated ? (
            <TransactionForm onAdded={handleTransactionAdded} />
          ) : (
            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          )
        )}

        {activeTab === 'list' && (
          <TransactionList transactions={filteredTransactions} onDelete={isAuthenticated ? handleDeleteTransaction : null} />
        )}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
        <a href="https://mirmdsalmanfarsi.netlify.app/" target="_blank" rel="noopener noreferrer">
          Developed By Mir MD Salman Farsi
        </a>
      </footer>
    </div>
  );
}

export default App;
