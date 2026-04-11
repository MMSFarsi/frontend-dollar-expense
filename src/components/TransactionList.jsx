import React from 'react';
import { ArrowDownRight, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="form-container animate-enter" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ImageIcon size={50} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-light)' }}>No transactions found</h3>
        <p style={{ color: 'var(--text-light)' }}>Add a new record to get started!</p>
      </div>
    );
  }

  return (
    <div className="transaction-list animate-enter">
      {transactions.map((t, index) => (
        <div className="transaction-item" key={t._id} style={{animationDelay: `${index * 0.1}s`}}>
          <div className="t-info">
            <div className={`t-icon ${t.type}`}>
              {t.type === 'income' ? <ArrowUpRight /> : <ArrowDownRight />}
            </div>
            <div className="t-details">
              <h4>{t.description}</h4>
              <p>{new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className={`t-amount ${t.type}`}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
            </div>
            {t.proofImage && (
              <a href={(t.proofImage.startsWith('http') || t.proofImage.startsWith('data:')) ? t.proofImage : `https://backend-kidsland-dollar.vercel.app${t.proofImage}`} target="_blank" rel="noopener noreferrer" title="View Proof">
                <img 
                  src={(t.proofImage.startsWith('http') || t.proofImage.startsWith('data:')) ? t.proofImage : `https://backend-kidsland-dollar.vercel.app${t.proofImage}`} 
                  alt="Proof" 
                  className="proof-img" 
                />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
