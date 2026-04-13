import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

const TransactionForm = ({ onAdded }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiScanning, setAiScanning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerAIOcr = async (imgFile) => {
    setAiScanning(true);
    setAiProgress(0);
    try {
      const result = await Tesseract.recognize(imgFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setAiProgress(Math.round(m.progress * 100));
          }
        }
      });
      const text = result.data.text;
      
      let newAmount = formData.amount;
      let newDesc = formData.description;

      const dollarMatches = text.match(/\$?\s*([0-9,]+(?:\.[0-9]{2}))/g);
      if (dollarMatches && dollarMatches.length > 0) {
        const floats = dollarMatches.map(v => parseFloat(v.replace(/[^0-9.]/g, '')));
        const maxFound = Math.max(...floats);
        if (maxFound > 0) {
          newAmount = maxFound.toString();
        }
      }

      if (!newDesc) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        if (lines.length > 0) {
          const nameLine = lines.find(l => !/^[\d\s.,$]+$/.test(l));
          if (nameLine) {
            newDesc = `[AI Scanned] ${nameLine}`;
          }
        }
      }

      setFormData(prev => ({ ...prev, amount: newAmount, description: newDesc }));
    } catch (err) {
      console.error("AI Scanner Error:", err);
    } finally {
      setAiScanning(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        triggerAIOcr(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fix 1: Validate token before sending
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    // Fix 2: Validate amount
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      setLoading(false);
      return;
    }

    let imgUrl = null;
    if (file) {
      try {
        const imgData = new FormData();
        imgData.append('image', file);
        const imgRes = await axios.post('https://api.imgbb.com/1/upload?key=f7bbe7e1f4e37550cabe1f78edc0b539', imgData);
        imgUrl = imgRes.data.data.url;
      } catch (err) {
        setError('Failed to upload image to ImgBB. Please try again.');
        setLoading(false);
        return;
      }
    }

    const payload = {
      type: formData.type,
      amount: parsedAmount,           // Fix 4: Send as number, not string
      description: formData.description,
      date: formData.date,
      ...(imgUrl && { proofImage: imgUrl }),
    };

    try {
      await axios.post(
        'https://backend-kidsland-dollar.vercel.app/api/transactions',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onAdded();
    } catch (err) {
      console.error('Transaction error:', err.response?.data);
      
      // Auto-logout if the token is expired or invalid
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }

      setError(err.response?.data?.message || 'Error adding record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container animate-enter">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Add New Record</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Transaction Type</label>
          <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
            <option value="income">Income (Earnings)</option>
            <option value="expense">Expense (Spendings)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            placeholder="e.g. 50.00"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            className="form-control"
            placeholder="e.g. Ticket Sales or Buying repair parts"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
          <label>Proof Document/Image</label>
          <div className="file-upload-wrapper">
            <div
              className="file-upload-btn"
              style={{ borderColor: file ? 'var(--income)' : '' }}
            >
              <UploadCloud
                size={30}
                style={{
                  display: 'block',
                  margin: '0 auto 10px',
                  color: file ? 'var(--income)' : 'inherit',
                }}
              />
              {file ? file.name : 'Click or Drag to Upload Proof'}
            </div>
            <input
              type="file"
              name="proofImage"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {aiScanning && (
            <div style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold', animation: 'bounceIn 1s infinite' }}>
              🤖 Extracting text with A.I... {aiProgress}%
            </div>
          )}
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Processing...' : <><CheckCircle size={20} /> Save Record</>}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;