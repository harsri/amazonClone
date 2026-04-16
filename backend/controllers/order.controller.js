const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Email Utilities ───────────────────────────────────────────────────
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationTemplate } = require('../utils/emailTemplates');

const DELIVERY_CHARGE = 49;
const TAX_RATE = 0.18; // 18% GST
const FREE_DELIVERY_THRESHOLD = 999;

/**
 * Generates a unique, meaningful order number.
 * Format: ORD-YYYYMMDD-U{userId}-{random4digit}
 * Example: ORD-20260416-U5-3847
 */
const generateOrderNumber = (userId) => {
  const now = new Date();
  const datePart = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
  return `ORD-${datePart}-U${userId}-${random}`;
};

const placeOrder = async (req, res) => {
  const { addressId, paymentMethod } = req.body;
  const userId = req.userId;

  if (!addressId) {
    return res.status(400).json({ error: 'Please select a delivery address.' });
  }

  try {
    // Generate order number before transaction
    const orderNumber = generateOrderNumber(userId);

    const result = await prisma.$transaction(async (tx) => {
      // Verify address belongs to user
      const address = await tx.address.findFirst({ where: { id: parseInt(addressId), userId } });
      if (!address) throw new Error('Invalid address selected.');

      // Get cart items
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true }
      });

      if (cartItems.length === 0) throw new Error('Cart is empty.');

      let subtotal = 0;
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`"${item.product.title}" has insufficient stock.`);
        }
        subtotal += item.product.price * item.quantity;
      }

      const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
      const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
      const totalAmount = parseFloat((subtotal + deliveryCharge + tax).toFixed(2));

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: parseInt(addressId),
          subtotal,
          deliveryCharge,
          tax,
          totalAmount,
          paymentMethod: paymentMethod || 'COD',
          status: 'PENDING'
        }
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: { orderId: order.id, productId: item.productId, quantity: item.quantity, price: item.product.price }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });

    // ─── Send Order Confirmation Email (non-blocking) ────────────────
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: result.id },
        include: {
          user: true,
          address: true,
          orderItems: { include: { product: true } }
        }
      });

      if (fullOrder && fullOrder.user?.email) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5 + Math.floor(Math.random() * 3));
        const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const products = fullOrder.orderItems.map((item) => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.price
        }));

        const html = orderConfirmationTemplate({
          userName: fullOrder.user.name,
          orderNumber: fullOrder.orderNumber,
          products,
          subtotal: fullOrder.subtotal,
          deliveryCharge: fullOrder.deliveryCharge,
          tax: fullOrder.tax,
          totalAmount: fullOrder.totalAmount,
          address: fullOrder.address,
          paymentMethod: fullOrder.paymentMethod,
          estimatedDelivery
        });

        await sendEmail({
          to: fullOrder.user.email,
          subject: `Amazon 247 — Order Confirmed! ${fullOrder.orderNumber}`,
          html
        });
      }
    } catch (emailError) {
      console.error('⚠️  Email notification failed (order still placed):', emailError.message);
    }

    res.status(201).json({ message: 'Order placed successfully!', order: result });
  } catch (error) {
    console.error('Place Order Error:', error);
    res.status(400).json({ error: error.message || 'Failed to place order.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        address: true,
        orderItems: {
          include: {
            product: { include: { images: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({ where: { id: parseInt(id), userId: req.userId } });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status !== 'DELIVERED') return res.status(400).json({ error: 'Only delivered orders can be returned.' });

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'RETURN_REQUESTED' }
    });
    res.status(200).json({ message: 'Return request submitted.', order: updated });
  } catch (error) {
    console.error('Return Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id: parseInt(id), userId: req.userId },
      include: { orderItems: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({ error: 'Only pending or processing orders can be cancelled.' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
      await tx.order.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' }
      });
    });

    res.status(200).json({ message: 'Order cancelled. Stock restored.' });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { placeOrder, getOrders, requestReturn, cancelOrder };
