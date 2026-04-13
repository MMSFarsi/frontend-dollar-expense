import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Image as ImageIcon, Filter, Trash2, Download, X } from 'lucide-react';

const TransactionList = ({ transactions, hideFilter = false, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setSelectedImage(null);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const openFullscreen = (imgUrl) => {
    setSelectedImage(imgUrl);
    setTimeout(() => {
      if (modalRef.current) {
        if (modalRef.current.requestFullscreen) {
          modalRef.current.requestFullscreen();
        } else if (modalRef.current.webkitRequestFullscreen) {
          modalRef.current.webkitRequestFullscreen();
        }
      }
    }, 50);
  };

  const closeFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setSelectedImage(null);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const exportToCSV = () => {
    // 1. Create CSV headers
    let csvContent = "Date,Time,Type,Amount,Description\n";
    
    // 2. Add each row
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString().replace(/,/g, '');
      const time = new Date(t.date).toLocaleTimeString().replace(/,/g, '');
      const type = t.type.toUpperCase();
      const amount = t.amount.toFixed(2);
      const desc = t.description.replace(/,/g, ' '); // remove commas from description so it doesnt break CSV
      csvContent += `${date},${time},${type},${amount},${desc}\n`;
    });

    // 3. Create a blob and temporary link to download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kidsland_records_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="transaction-list-wrapper animate-enter">
      {!hideFilter && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--box-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Filter size={18} color="var(--primary)" />
            <strong style={{ color: 'var(--text-dark)' }}>Filter:</strong>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '0.5rem', border: '2px solid var(--input-border)', background: 'var(--bg-color)', color: 'var(--text-dark)', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Records</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
          
          <button 
            className="btn" 
            onClick={exportToCSV} 
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', backgroundColor: 'var(--secondary)' }}
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>
      )}
      
      <div className="transaction-list">
        {filteredTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>No {filter} found.</p>
        ) : (
          filteredTransactions.map((t, index) => (
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
            {t.proofImage && (() => {
              const imgUrl = (t.proofImage.startsWith('http') || t.proofImage.startsWith('data:')) ? t.proofImage : `https://backend-kidsland-dollar.vercel.app${t.proofImage}`;
              return (
                <div onClick={() => openFullscreen(imgUrl)} title="View Proof Fullscreen" style={{ cursor: 'fullscreen' }}>
                  <img src={imgUrl} alt="Proof" className="proof-img" />
                </div>
              );
            })()}
            {onDelete && (
              <button 
                onClick={() => {
                  if(window.confirm('Are you strictly sure you want to permanently delete this transaction?')) {
                    onDelete(t._id);
                  }
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--expense)', padding: '5px' }}
                title="Delete Record"
              >
                <Trash2 size={24} />
              </button>
            )}
          </div>
        </div>
        )))}
      </div>

      {/* Full Browser Native Fullscreen Modal Component */}
      {selectedImage && (
        <div 
          ref={modalRef}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <button 
            onClick={closeFullscreen} 
            style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            title="Close Fullscreen"
          >
            <X size={30} />
          </button>
          <img 
            src={selectedImage} 
            alt="Proof Fullsize" 
            style={{ maxWidth: '100vw', maxHeight: '100vh', objectFit: 'contain' }} 
            onClick={(e) => Object.hasOwn(document, 'pictureInPictureEnabled') } /* Noop prevent error */
          />
        </div>
      )}

    </div>
  );
};

export default TransactionList;
