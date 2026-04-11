import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle } from 'lucide-react';

const TransactionForm = ({ onAdded }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      // Fix 5: Log full error for easier debugging
      console.error('Transaction error:', err.response?.data);
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
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Processing...' : <><CheckCircle size={20} /> Save Record</>}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;