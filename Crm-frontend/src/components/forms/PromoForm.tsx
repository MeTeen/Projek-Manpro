// src/components/forms/PromoForm.tsx
import React from 'react';
import { PromoInput } from '../../services/promoService';
import { FormInput, FormSelect, FormTextarea } from '../ui';

interface PromoFormProps {
  formData: Partial<PromoInput>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const PromoForm: React.FC<PromoFormProps> = ({ formData, onFormChange }) => {
  return (
    <>
      <FormInput
        label="Name"
        name="name"
        type="text"
        value={formData.name || ''}
        onChange={onFormChange}
        required
        placeholder="Enter promo name"
      />
      
      <FormTextarea
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={onFormChange}
        placeholder="Enter promo description"
        rows={3}
      />
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <FormSelect
            label="Type"
            name="type"
            value={formData.type || 'percentage'}
            onChange={onFormChange}
            required
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount (IDR)</option>
          </FormSelect>
        </div>
        
        <div style={{ flex: 1 }}>
          <FormInput
            label="Value"
            name="value"
            type="number"
            value={formData.value?.toString() || '0'}
            onChange={onFormChange}
            required
            min="0"
            placeholder="Enter value"
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <FormInput
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={onFormChange}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <FormInput
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={onFormChange}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151'
        }}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive === undefined ? true : formData.isActive}
            onChange={onFormChange}
            style={{ 
              marginRight: '8px', 
              height: '16px', 
              width: '16px'
            }}
          />
          Is Active
        </label>
      </div>
    </>
  );
};

export default PromoForm;