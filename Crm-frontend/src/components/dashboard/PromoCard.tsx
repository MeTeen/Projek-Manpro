import React from 'react';

const PromoCard: React.FC = () => {
  return (
    <div className="bg-indigo-600 text-white rounded-lg p-5 relative overflow-hidden">
      {/* Blue dot in the top right */}
      <div className="absolute top-4 right-4 h-2 w-2 bg-white rounded-full"></div>
      
      {/* Customer avatar */}
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-3">
          D
        </div>
        <div>
          <h3 className="font-medium">Customer D</h3>
          <p className="text-sm text-indigo-200">Surabaya, Jawa Timur</p>
        </div>
      </div>
      
      {/* Expiry */}
      <div className="mb-4">
        <p className="text-xs text-indigo-200">Expired on</p>
        <p className="text-sm">Mar 23 2023, 23:59</p>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-indigo-200">Total Spend</p>
          <p className="font-medium">300 $</p>
        </div>
        <div>
          <p className="text-xs text-indigo-200">Total Purchase</p>
          <p className="font-medium">8x</p>
        </div>
      </div>
      
      {/* Discount */}
      <div className="mb-5">
        <p className="text-xs text-indigo-200">Discount</p>
        <p className="font-medium">10%</p>
      </div>
      
      {/* Accept button */}
      <button className="bg-white text-indigo-600 rounded-md py-2 px-4 w-full text-sm font-medium">
        Accept Promo
      </button>
    </div>
  );
};

export default PromoCard;
