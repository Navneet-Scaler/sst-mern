const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables

mongoose
  .connect(
    "mongodb+srv://navneet0469:xMD3elKg96NmH7JM@cluster0.3iv5csu.mongodb.net/yourDatabaseName?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
      connectTimeoutMS: 10000, // Timeout for initial connection
    }
  )
  .then(() => {
    console.log("Db Connected");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err.message);
  });

mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  product_price: {
    type: Number,
    required: true,
  },
  isInStock: {
    type: Boolean,
    required: true,
  },
  category: {
    type: String,
    required: true,
  }
});

const productModel = mongoose.model("Product", productSchema);

const app = express();
app.use(express.json());

app.post('/api/products', async (req, res) => {
  try {
    const product = new productModel({
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      isInStock: req.body.isInStock,
      category: req.body.category
    });
    await product.save();
    console.log(product);
    return res.status(201).json({ message: "Product Created", product });
  } catch (err) {
    return res.status(400).json({ message: "Error creating product", error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  const allProducts = await productModel.find();
  res.json(allProducts);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.put('/api/products', async (req, res) => {
  const updatedProducts = await productModel.updateMany({}, req.body);
  res.json({ message: "All products updated", updatedCount: updatedProducts.nModified });
});

app.put('/api/products/:id', async (req, res) => {
  const product = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
  if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
  res.json(deletedProduct);
});

app.listen(8090, () => {
  console.log("Server started at port 8090");
});
