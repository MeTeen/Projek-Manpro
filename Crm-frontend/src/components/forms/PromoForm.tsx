// src/components/forms/PromoForm.tsx
import React from 'react';
import { PromoInput } from '../../services/promoService'; // Sesuaikan path

interface PromoFormProps {
  formData: Partial<PromoInput>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  // Anda bisa tambahkan props lain jika perlu, misal isSubmitting
}

const PromoForm: React.FC<PromoFormProps> = ({ formData, onFormChange }) => {
  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={onFormChange}
          required
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={onFormChange}
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Type*</label>
          <select
            name="type"
            value={formData.type || 'percentage'}
            onChange={onFormChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '44px' }}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount (IDR)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Value*</label>
          <input
            type="number"
            name="value"
            value={formData.value || 0}
            onChange={onFormChange}
            min="0"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={onFormChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={onFormChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive === undefined ? true : formData.isActive}
            onChange={onFormChange}
            style={{ marginRight: '8px', height: '16px', width: '16px' }}
          />
          Is Active
        </label>
      </div>
    </>
  );
};

export default PromoForm;