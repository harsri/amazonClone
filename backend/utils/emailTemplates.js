/**
 * Email Templates Module — Amazon 247
 * Generates reusable HTML email templates with Amazon-inspired styling.
 */

/**
 * Generates a password reset OTP email
 * @param {Object} data
 * @param {string} data.userName
 * @param {string} data.otp - 6-digit OTP
 * @returns {string} HTML email
 */
const passwordResetTemplate = (data) => {
  const { userName, otp } = data;
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#e3e6e6;font-family:'Amazon Ember',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e3e6e6;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:#131921;padding:18px 30px;text-align:center;">
          <span style="font-size:28px;font-weight:700;color:#fff;">amazon</span>
          <span style="font-size:14px;color:#ff9900;font-weight:700;"> 247</span>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#0f1111;margin:0 0 16px;">Password Reset Request</h2>
          <p style="color:#565959;font-size:14px;line-height:1.6;">Hello <strong>${userName}</strong>,</p>
          <p style="color:#565959;font-size:14px;line-height:1.6;">We received a request to reset your password. Use the OTP below to proceed:</p>
          <div style="text-align:center;margin:24px 0;">
            <div style="display:inline-block;background:#f0f2f2;border:2px dashed #c45500;border-radius:8px;padding:16px 40px;">
              <span style="font-size:32px;font-weight:700;color:#0f1111;letter-spacing:8px;">${otp}</span>
            </div>
          </div>
          <p style="color:#565959;font-size:14px;line-height:1.6;">This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
          <p style="color:#999;font-size:12px;margin-top:24px;">For security, never share this OTP with anyone.</p>
        </td></tr>
        <tr><td style="background:#f0f2f2;padding:16px 30px;text-align:center;border-top:1px solid #e7e7e7;">
          <div style="font-size:11px;color:#999;">© ${new Date().getFullYear()} Amazon 247. All rights reserved.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/**
 * Generates an order confirmation HTML email
 */
const orderConfirmationTemplate = (data) => {
  const { userName, orderNumber, products, subtotal, deliveryCharge, tax, totalAmount, address, paymentMethod, estimatedDelivery } = data;

  const productRows = products.map((item) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-size:14px;color:#0f1111;">${item.title}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-size:14px;color:#565959;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-size:14px;color:#0f1111;text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const formattedAddress = [
    address.fullName, address.houseNo, address.addressLine1, address.addressLine2,
    address.landmark ? `Near: ${address.landmark}` : '',
    `${address.city}, ${address.state} - ${address.pincode}`,
    `Phone: ${address.phone}`
  ].filter(Boolean).join('<br/>');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#e3e6e6;font-family:'Amazon Ember',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e3e6e6;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:#131921;padding:18px 30px;text-align:center;">
          <span style="font-size:28px;font-weight:700;color:#fff;">amazon</span>
          <span style="font-size:14px;color:#ff9900;font-weight:700;"> 247</span>
        </td></tr>
        <tr><td style="background:linear-gradient(135deg,#067d62 0%,#1a8c5f 100%);padding:24px 30px;text-align:center;">
          <div style="font-size:18px;color:#fff;font-weight:700;margin-bottom:6px;">✓ Order Confirmed!</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);">Thank you for shopping with us, ${userName}</div>
        </td></tr>
        <tr><td style="padding:24px 30px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#565959;">Order Number</td>
              <td style="font-size:13px;color:#565959;text-align:right;">Estimated Delivery</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#0f1111;padding-top:4px;">${orderNumber}</td>
              <td style="font-size:16px;font-weight:700;color:#067d62;text-align:right;padding-top:4px;">${estimatedDelivery}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 30px;"><div style="border-top:1px solid #e7e7e7;"></div></td></tr>
        <tr><td style="padding:20px 30px;">
          <div style="font-size:16px;font-weight:700;color:#0f1111;margin-bottom:14px;">Items Ordered</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e7e7;border-radius:4px;">
            <thead><tr style="background:#f0f2f2;">
              <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#565959;text-transform:uppercase;">Product</th>
              <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:700;color:#565959;text-transform:uppercase;">Qty</th>
              <th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:700;color:#565959;text-transform:uppercase;">Amount</th>
            </tr></thead>
            <tbody>${productRows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:0 30px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f8;border-radius:4px;padding:16px;">
            <tr><td style="padding:8px 16px;font-size:14px;color:#565959;">Subtotal</td><td style="padding:8px 16px;font-size:14px;color:#0f1111;text-align:right;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#565959;">Delivery</td><td style="padding:8px 16px;font-size:14px;color:${deliveryCharge===0?'#067d62':'#0f1111'};text-align:right;">${deliveryCharge===0?'FREE':'₹'+deliveryCharge}</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#565959;">GST (18%)</td><td style="padding:8px 16px;font-size:14px;color:#0f1111;text-align:right;">₹${tax.toLocaleString('en-IN')}</td></tr>
            <tr><td style="padding:12px 16px;font-size:18px;font-weight:700;color:#B12704;border-top:2px solid #e7e7e7;">Grand Total</td><td style="padding:12px 16px;font-size:18px;font-weight:700;color:#B12704;text-align:right;border-top:2px solid #e7e7e7;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 30px;"><div style="border-top:1px solid #e7e7e7;"></div></td></tr>
        <tr><td style="padding:20px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="50%" valign="top" style="padding-right:15px;">
              <div style="font-size:14px;font-weight:700;color:#0f1111;margin-bottom:8px;">Shipping Address</div>
              <div style="font-size:13px;color:#565959;line-height:1.6;">${formattedAddress}</div>
            </td>
            <td width="50%" valign="top" style="padding-left:15px;">
              <div style="font-size:14px;font-weight:700;color:#0f1111;margin-bottom:8px;">Payment Method</div>
              <div style="font-size:13px;color:#565959;line-height:1.6;">${paymentMethod==='COD'?'Cash on Delivery (COD)':paymentMethod}</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:10px 30px 24px;text-align:center;">
          <a href="http://localhost:5173/orders" style="display:inline-block;background:#FFD814;color:#0f1111;padding:12px 40px;border-radius:20px;text-decoration:none;font-size:14px;font-weight:700;border:1px solid #FCD200;">View Your Orders</a>
        </td></tr>
        <tr><td style="background:#f0f2f2;padding:20px 30px;text-align:center;border-top:1px solid #e7e7e7;">
          <div style="font-size:12px;color:#565959;line-height:1.6;">This email was sent from Amazon 247.<br/>Visit our <a href="http://localhost:5173/support" style="color:#007185;text-decoration:none;">Help & Support</a> page for queries.</div>
          <div style="font-size:11px;color:#999;margin-top:10px;">© ${new Date().getFullYear()} Amazon 247. All rights reserved.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

module.exports = { orderConfirmationTemplate, passwordResetTemplate };
