import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Wallet, LayoutDashboard, List as ListIcon, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleTransactionAdded = () => {
    fetchTransactions();
    setActiveTab('list');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    if (activeTab === 'add') setActiveTab('dashboard');
  };

  return (
    <div className="app-container">
      <header className="header animate-enter">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="https://kidsland.com.bd/logo.png" alt="Kidsland Logo" style={{ height: '50px', objectFit: 'contain' }} />
          Kidsland Dollar Report
        </h1>
        <nav className="nav-links">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <LayoutDashboard size={18} style={{marginRight: '5px', verticalAlign: 'middle'}}/> Dashboard
          </a>
          <a href="#" className={activeTab === 'add' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('add'); }}>
            <PlusCircle size={18} style={{marginRight: '5px', verticalAlign: 'middle'}}/> Add Record
          </a>
          <a href="#" className={activeTab === 'list' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('list'); }}>
            <ListIcon size={18} style={{marginRight: '5px', verticalAlign: 'middle'}}/> All Records
          </a>
          {isAuthenticated && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--expense)' }}>
              <LogOut size={18} style={{marginRight: '5px', verticalAlign: 'middle'}}/> Logout
            </a>
          )}
        </nav>
      </header>

      <main className="animate-enter" style={{animationDelay: '0.1s'}}>
        {activeTab === 'dashboard' && (
          <Dashboard balance={balance} income={totalIncome} expense={totalExpense} />
        )}

        {activeTab === 'add' && (
          isAuthenticated ? (
            <TransactionForm onAdded={handleTransactionAdded} />
          ) : (
            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          )
        )}

        {activeTab === 'list' && (
          <TransactionList transactions={transactions} />
        )}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
        Developed By Mir Md Salman Farsi
      </footer>
    </div>
  );
}

export default App;
