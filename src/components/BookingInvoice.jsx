import React from 'react';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const BookingInvoice = React.forwardRef(({ booking }, ref) => {
  const {
    booking_ref, created_at, status,
    property_title, property_location,
    guest_name, guest_email, guest_phone,
    checkin_date, checkout_date, guests, nights,
    subtotal, cleaning_fee, service_fee, loyalty_discount, total,
    payment_id,
  } = booking;

  return (
    <div
      ref={ref}
      style={{
        fontFamily: 'Georgia, serif',
        padding: '48px',
        maxWidth: '680px',
        margin: '0 auto',
        color: '#1a1a1a',
        backgroundColor: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '3px solid #D4AF37', paddingBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            The Golden Stay
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Khair, Aligarh, UP · +91 98765 43210</div>
          <div style={{ fontSize: '12px', color: '#888' }}>concierge@goldenstay.com</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#D4AF37' }}>INVOICE</div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}># {booking_ref}</div>
          {created_at && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
              Issued: {formatDate(created_at)}
            </div>
          )}
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backgroundColor: status === 'confirmed' ? '#dcfce7' : status === 'cancelled' ? '#fee2e2' : '#fef9c3',
            color: status === 'confirmed' ? '#166534' : status === 'cancelled' ? '#991b1b' : '#854d0e',
          }}>
            {status ?? 'Confirmed'}
          </div>
        </div>
      </div>

      {/* Guest + Property */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '36px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#D4AF37', marginBottom: '10px' }}>
            Billed To
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>{guest_name}</div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>{guest_email}</div>
          {guest_phone && <div style={{ fontSize: '13px', color: '#555' }}>+91 {guest_phone}</div>}
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#D4AF37', marginBottom: '10px' }}>
            Property
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>{property_title}</div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>{property_location}</div>
        </div>
      </div>

      {/* Stay Details */}
      <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#D4AF37', marginBottom: '14px' }}>
          Stay Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Check-in', value: formatDate(checkin_date) },
            { label: 'Check-out', value: formatDate(checkout_date) },
            { label: 'Guests · Nights', value: `${guests} guests · ${nights} nights` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>Description</th>
            <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: `Accommodation (${nights} night${nights !== 1 ? 's' : ''})`, value: subtotal },
            { label: 'Cleaning Fee', value: cleaning_fee },
            { label: 'Service Fee', value: service_fee },
          ].map(({ label, value }) => (
            <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 14px', fontSize: '13px', color: '#333' }}>{label}</td>
              <td style={{ padding: '12px 14px', fontSize: '13px', textAlign: 'right' }}>{fmt(value)}</td>
            </tr>
          ))}
          {loyalty_discount > 0 && (
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 14px', fontSize: '13px', color: '#16a34a' }}>Loyalty Points Discount</td>
              <td style={{ padding: '12px 14px', fontSize: '13px', textAlign: 'right', color: '#16a34a' }}>- {fmt(loyalty_discount)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#1a1a1a' }}>
            <td style={{ padding: '14px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>Total Paid</td>
            <td style={{ padding: '14px', fontSize: '15px', fontWeight: '700', color: '#D4AF37', textAlign: 'right' }}>{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Payment ID */}
      {payment_id && !payment_id.startsWith('DEMO') && (
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '40px' }}>
          Payment ID: {payment_id}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '24px', marginTop: '32px', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
        <p>Thank you for choosing The Golden Stay. We look forward to hosting you.</p>
        <p style={{ marginTop: '6px' }}>For support: concierge@goldenstay.com · +91 98765 43210</p>
        <p style={{ marginTop: '12px', fontSize: '11px', color: '#ccc' }}>
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
});

BookingInvoice.displayName = 'BookingInvoice';
export default BookingInvoice;
