import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import './Orders.scss';

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'buy-again', 'not-shipped'
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('2026'); // Example filter

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleReturn = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/return`);
      toast.success('Return request submitted!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request return.');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order.');
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart.');
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab === 'not-shipped' && !['PENDING', 'PROCESSING'].includes(order.status)) return false;
    
    // Search filter (handles title and orderNumber)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = order.orderItems.some(item => item.product.title.toLowerCase().includes(q));
      const matchesId = order.orderNumber.toLowerCase().includes(q);
      if (!matchesTitle && !matchesId) return false;
    }

    // Time filter (simplistic for now)
    const orderYear = new Date(order.createdAt).getFullYear().toString();
    if (timeFilter !== 'all' && timeFilter !== orderYear) {
      // Handle "past 3 months" logic if needed, for now just year based as per UI request
      if (timeFilter === 'past3') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (new Date(order.createdAt) < threeMonthsAgo) return false;
      } else {
        if (timeFilter !== orderYear) return false;
      }
    }

    return true;
  });

  const buyAgainProducts = [];
  if (activeTab === 'buy-again') {
    const seen = new Set();
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!seen.has(item.productId)) {
          buyAgainProducts.push(item.product);
          seen.add(item.productId);
        }
      });
    });
  }

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        <nav className="orders-page__breadcrumb">
          Your Account › <span className="active">Your Orders</span>
        </nav>

        <div className="orders-page__header">
          <h1>Your Orders</h1>
          <div className="orders-page__search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search all orders" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search Orders</button>
          </div>
        </div>

        <div className="orders-page__tabs">
          <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={`tab ${activeTab === 'buy-again' ? 'active' : ''}`} onClick={() => setActiveTab('buy-again')}>Buy Again</button>
          <button className={`tab ${activeTab === 'not-shipped' ? 'active' : ''}`} onClick={() => setActiveTab('not-shipped')}>Not Yet Shipped</button>
        </div>

        {activeTab !== 'buy-again' && (
          <div className="orders-page__filterRow">
            <span className="count">{filteredOrders.length} orders</span>
            <div className="filter-select">
              <label>placed in </label>
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                <option value="all">All time</option>
                <option value="past3">past 3 months</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        )}

        <div className="orders-page__content">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : activeTab === 'buy-again' ? (
            <div className="buy-again-grid">
              {buyAgainProducts.length > 0 ? (
                buyAgainProducts.map(product => (
                  <div key={product.id} className="buy-again-card">
                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.title} />
                    <p className="title">{product.title}</p>
                    <button className="buy-btn" onClick={() => addToCart(product.id)}>Buy it again</button>
                  </div>
                ))
              ) : (
                <p>No products available to buy again yet.</p>
              )}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <FiAlertCircle className="empty-icon" />
              <p>Looks like you did not place an order in this period.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card__header">
                  <div className="left">
                    <div className="info-block">
                      <span className="label">ORDER PLACED</span>
                      <span className="val">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="info-block">
                      <span className="label">TOTAL</span>
                      <span className="val">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="info-block">
                      <span className="label">SHIP TO</span>
                      <span className="val link">{order.address?.fullName} <FiChevronDown /></span>
                    </div>
                  </div>
                  <div className="right">
                    <div className="info-block">
                      <span className="label">ORDER # {order.orderNumber}</span>
                      <div className="links">
                        <span className="link">View order details</span>
                        <span className="divider">|</span>
                        <span className="link">Invoice</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card__body">
                  <div className="status-header">
                    <h3>{order.status === 'DELIVERED' ? 'Delivered' : order.status}</h3>
                  </div>
                  
                  <div className="items-list">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="item-row">
                        <div className="item-main">
                          <img src={item.product?.images?.[0]?.url} alt={item.product?.title} />
                          <div className="details">
                            <p className="titleLink">{item.product?.title}</p>
                            <p className="return-policy">Return window closed on {new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 30)).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                            <div className="actions">
                              <button className="buy-again-btn" onClick={() => addToCart(item.productId)}>
                                <span className="icon">↺</span> Buy it again
                              </button>
                              <button className="secondary-btn">View your item</button>
                            </div>
                          </div>
                        </div>
                        <div className="item-side">
                          <button className="full-btn">Track package</button>
                          {order.status === 'DELIVERED' && <button className="full-btn secondary" onClick={() => handleReturn(order.id)}>Return items</button>}
                          <button className="full-btn secondary">Leave product review</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-card__footer">
                  <span className="archive link">Archive order</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
