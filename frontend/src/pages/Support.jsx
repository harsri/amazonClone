import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiBook, 
  FiMail, 
  FiTag, 
  FiMapPin, 
  FiPhone 
} from 'react-icons/fi';
import './Support.scss';

const FAQS = [
  { q: 'Where is my order?', a: 'Go to the Orders page to track your order status in real time — from Pending to Delivered.' },
  { q: 'How do I return an item?', a: 'Once your order status is "Delivered", open the order and click "Request Return / Refund". Our team will process it within 3-5 business days.' },
  { q: 'What payment methods are accepted?', a: 'Currently we accept Cash on Delivery (COD). More payment options coming soon!' },
  { q: 'How do I change my delivery address?', a: 'Go to the Address Book page from your account. You can add, edit or set a default address before placing an order.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard JWT authentication and your passwords are encrypted with bcrypt.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. We ship from multiple warehouses across India to ensure fast delivery.' },
];

const CATEGORIES = ['Return / Refund', 'Payment Issue', 'Delivery Problem', 'Wrong Product', 'Product Quality', 'Technical Issue', 'Other'];

const Support = () => {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Other');
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support');
      setTickets(res.data.tickets || []);
    } catch {}
  };

  useEffect(() => { if (user) fetchTickets(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/support', { subject, message, category });
      toast.success('Support ticket submitted! We\'ll get back to you soon.');
      setSubject(''); setMessage(''); setCategory('Other');
      fetchTickets();
      setActiveTab('tickets');
    } catch {
      toast.error('Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support">
      <div className="support__hero">
        <h1>Help & Customer Service</h1>
        <p>Search our Help Center, contact us or browse topics below</p>
      </div>

      <div className="support__container">
        {/* Tabs */}
        <div className="support__tabs">
          <button className={`support__tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>
            <FiBook /> FAQ
          </button>
          <button className={`support__tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
            <FiMail /> Contact Us
          </button>
          {user && (
            <button className={`support__tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
              <FiTag /> My Tickets ({tickets.length})
            </button>
          )}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="support__faq">
            {FAQS.map((faq, i) => (
              <div className={`support__faqItem ${openFaq === i ? 'open' : ''}`} key={i}>
                <button className="support__faqQ" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span>{openFaq === i ? <FiChevronDown /> : <FiChevronRight />}</span>
                </button>
                {openFaq === i && <p className="support__faqA">{faq.a}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="support__form">
            <h2>Contact Us</h2>
            <div className="support__directContact">
              <p><FiMapPin className="icon" /> <strong>Headquarters:</strong> Amazon 247 Towers, Tech Park, Bengaluru, India 560001</p>
              <p><FiPhone className="icon" /> <strong>Phone:</strong> 1800-123-4567 (Toll Free, 24x7)</p>
              <p><FiMail className="icon" /> <strong>Email:</strong> support@amazon247.in</p>
            </div>
            
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
            
            <h2>Submit a Support Request</h2>
            {!user && <p className="support__loginNote">Please <a href="/login">log in</a> to submit a ticket and track your issues.</p>}
            <form onSubmit={handleSubmit}>
              <div className="support__formRow">
                <label>Issue Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="support__formRow">
                <label>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Brief description of your issue" />
              </div>
              <div className="support__formRow">
                <label>Detailed Description</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} placeholder="Please describe your issue in detail..." />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting || !user}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* My Tickets */}
        {activeTab === 'tickets' && user && (
          <div className="support__tickets">
            <h2>Your Support Tickets</h2>
            {tickets.length === 0 ? (
              <p className="support__noTickets">You have no support tickets yet.</p>
            ) : (
              tickets.map(t => (
                <div className="ticketCard" key={t.id}>
                  <div className="ticketCard__header">
                    <span className="ticketCard__category">{t.category}</span>
                    <h3>{t.subject}</h3>
                    <span className={`ticketCard__status ${t.status.toLowerCase()}`}>{t.status}</span>
                  </div>
                  <p className="ticketCard__message">{t.message}</p>
                  {t.resolution && (
                    <div className="ticketCard__resolution">
                      <strong>Resolution:</strong> {t.resolution}
                    </div>
                  )}
                  <p className="ticketCard__date">Submitted: {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
