const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
           include: {
              images: true
           }
        }
      }
    });
    res.status(200).json({ cartItems });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.userId;

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10.' });
    }

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.stock === 0) {
      return res.status(400).json({ error: 'Product is out of stock.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > 10) {
        return res.status(400).json({ error: 'Cannot add more than 10 items of the same product to cart.' });
      }
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: `Only ${product.stock} items available in stock.` });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
      return res.status(200).json({ message: "Cart updated", item: updatedItem });
    }

    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity
      }
    });

    res.status(201).json({ message: "Added to cart", item: newItem });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10.' });
    }

    // Get cart item to find product
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ error: `Only ${cartItem.product.stock} items available in stock.` });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity }
    });

    res.status(200).json({ message: "Cart item updated", item: updatedItem });
  } catch (error) {
    console.error("Update Cart Item Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.userId }
    });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
