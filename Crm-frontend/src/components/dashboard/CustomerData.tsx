import { Circle, ChevronRight } from "lucide-react";

const customerData = [
  {
    letter: "A",
    name: "Customer A",
    spend: "339$",
    purchase: "8x",
    date: "Jan 14, 07:00 AM",
    discount: "10%",
    purchased: false
  },
  {
    letter: "B",
    name: "Customer B",
    spend: "429$",
    purchase: "3x",
    date: "Nov 17, 10:00 AM",
    discount: "10%",
    purchased: false
  },
  {
    letter: "A",
    name: "Customer A",
    spend: "339$",
    purchase: "8x",
    purchased: true
  }
];

const orders = [
  {
    date: "12 September 2024",
    detail: "1 pcs | Order Meja Kayu | 25 cm x 16 cm x 10 cm"
  },
  {
    date: "5 September 2024",
    detail: "4 pcs | Order Kursi Kayu | 47 cm x 37 cm x 27 cm"
  }
];

export default function CustomerData() {
  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Recent Promo</h2>
        <a href="#" className="view-all">View All</a>
      </div>
      
      {customerData.map((customer, index) => (
        <div key={index} className="customer-card">
          <div className="customer-row">
            <div className="customer-letter">{customer.letter}</div>
            <div className="customer-details">
              <div className="customer-name">{customer.name}</div>
              <div className="customer-spend">
                Total Spend: {customer.spend} | Total Purchase: {customer.purchase}
              </div>
            </div>
            {customer.date && (
              <div className="customer-date">{customer.date}</div>
            )}
          </div>
          
          <div className="customer-footer">
            {customer.discount && (
              <div className="discount-badge">Discount {customer.discount}</div>
            )}
            {customer.purchased && (
              <div className="purchased-badge">PURCHASED</div>
            )}
            {!customer.purchased && customer.discount && (
              <ChevronRight size={16} className="chevron-icon" />
            )}
          </div>
        </div>
      ))}
      
      <div className="order-section">
        {orders.map((order, index) => (
          <div key={index}>
            <div className="order-date">{order.date}</div>
            <div className="order-item">
              <div className="order-icon">
                <Circle size={8} fill="#635BFF" stroke="none" />
              </div>
              <div className="order-details">{order.detail}</div>
            </div>
          </div>
        ))}
        <div className="load-more">Load More</div>
      </div>
    </div>
  );
} 