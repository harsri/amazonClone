const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Helper: Check and Reset Stock After 24 Hours ──────────────────────
const checkAndResetStock = async (product) => {
  if (product.stock === 0) {
    const now = new Date();
    const resetTime = new Date(product.stockResetAt);
    const hoursElapsed = (now - resetTime) / (1000 * 60 * 60);

    if (hoursElapsed >= 24) {
      // Reset stock to 100 after 24 hours
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: 100, stockResetAt: new Date() }
      });
      return { ...product, stock: 100, stockResetAt: new Date() };
    }
  }
  return product;
};

const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, brand } = req.query;

    const whereClause = {};

    if (category) {
      whereClause.category = { name: { contains: category } };
    }

    if (brand) {
      whereClause.brand = { contains: brand };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    let orderBy = {};
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating_desc') orderBy = { ratings: 'desc' };

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      include: {
        category: true,
        images: true
      }
    });

    // Check and reset stock for products with 0 stock after 24 hours
    const updatedProducts = await Promise.all(
      products.map(product => checkAndResetStock(product))
    );

    res.status(200).json({ products: updatedProducts });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        images: true
      }
    });

    if (!product) {
       return res.status(404).json({ error: "Product not found." });
    }

    // Check and reset stock if 24 hours have passed and stock is 0
    const updatedProduct = await checkAndResetStock(product);

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const checkDeliverability = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({ error: "Pincode is required." });
    }

    const deliverable = await prisma.deliverablePincode.findUnique({
      where: { pincode }
    });

    if (deliverable) {
      return res.status(200).json({ deliverable: true, message: `Delivery available to ${deliverable.city}, ${deliverable.state}` });
    } else {
      return res.status(200).json({ deliverable: false, message: "Delivery not available to this pincode." });
    }
  } catch (error) {
    console.error("Check Pincode Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getProducts,
  getProductById,
  checkDeliverability
};
