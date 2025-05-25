const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Joi = require("joi");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/realty_app")
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Schema and model for properties
const propertySchema = new mongoose.Schema({
  address: String,
  type: String,
  price: Number,
  description: String,
  sold: { type: Boolean, default: false },
  saleDate: Date,
});
const Property = mongoose.model("Property", propertySchema, "properties");

// Schema and model for showings
const showingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  date: Date,
  clientName: String,
  phone: String,
  email: String,
});
const Showing = mongoose.model("Showing", showingSchema, "showings");

// Validation for /api/showings/list
const showingListSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
}).strict();

// API endpoint for showings/list
app.get("/api/showings/list", async (req, res) => {
  try {
    const dtoIn = { date: req.query.month };
    const { error } = showingListSchema.validate(dtoIn);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const month = dtoIn.date;
    let query = {};

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: "Invalid year or month" });
      }
      const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      const now = new Date();
      const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const showings = await Showing.find(query)
      .populate("propertyId")
      .sort({ date: 1 });

    const itemList = showings.map((showing) => ({
      id: showing._id.toString(),
      propertyId: showing.propertyId ? showing.propertyId._id.toString() : null,
      date: showing.date.toISOString(),
      clientName: showing.clientName,
      phone: showing.phone || null,
      email: showing.email || null,
    }));

    const propertyMap = {};
    showings.forEach((showing) => {
      if (showing.propertyId) {
        const propId = showing.propertyId._id.toString();
        propertyMap[propId] = {
          id: propId,
          address: showing.propertyId.address,
          type: showing.propertyId.type,
          price: showing.propertyId.price,
          description: showing.propertyId.description || null,
          sold: showing.propertyId.sold,
          saleDate: showing.propertyId.saleDate ? showing.propertyId.saleDate.toISOString() : null,
        };
      }
    });

    res.json({ itemList, propertyMap });
  } catch (err) {
    console.error("Error in /api/showings/list:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoints for properties
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error("Error in /api/properties:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/properties/unsold", async (req, res) => {
  try {
    const unsoldCount = await Property.countDocuments({ sold: false });
    res.json({ unsoldCount });
  } catch (err) {
    console.error("Error in /api/properties/unsold:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/properties", async (req, res) => {
  try {
    const { error } = Joi.object({
      address: Joi.string().min(1).required(),
      type: Joi.string().min(1).required(),
      price: Joi.any()
        .custom((value, helpers) => {
          const num = Number(value);
          if (isNaN(num) || num <= 0) {
            return helpers.error("any.invalid");
          }
          return num;
        }, "convert to number")
        .required(),
      description: Joi.string().allow("").optional(),
      sold: Joi.boolean().optional(),
      saleDate: Joi.string().allow("", null).optional(),
    })
      .strict()
      .validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const property = new Property({
      ...req.body,
      price: Number(req.body.price),
    });
    await property.save();
    res.status(201).json({
      id: property._id.toString(),
      address: property.address,
      type: property.type,
      price: property.price,
      description: property.description || null,
      sold: property.sold,
      saleDate: property.saleDate ? property.saleDate.toISOString() : null,
    });
  } catch (err) {
    console.error("Error in /api/properties POST:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("Error in /api/properties/:id PUT:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });
    await Showing.deleteMany({ propertyId: req.params.id });
    res.json({ message: "Property and associated showings deleted" });
  } catch (err) {
    console.error("Error in /api/properties/:id DELETE:", err);
    res.status(400).json({ error: err.message });
  }
});

// API endpoints for showings
app.get("/api/showings/property/:propertyId", async (req, res) => {
  try {
    const showings = await Showing.find({ propertyId: req.params.propertyId });
    res.json(showings);
  } catch (err) {
    console.error("Error in /api/showings/property/:propertyId:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/showings/active", async (req, res) => {
  try {
    const unsoldProperties = await Property.find({ sold: false }).select("_id");
    const unsoldIds = unsoldProperties.map((p) => p._id);
    const activeCount = await Showing.countDocuments({
      propertyId: { $in: unsoldIds },
    });
    res.json({ activeCount });
  } catch (err) {
    console.error("Error in /api/showings/active:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/showings", async (req, res) => {
  try {
    const { error } = Joi.object({
      propertyId: Joi.string().required(),
      date: Joi.string().required(),
      clientName: Joi.string().required(),
      phone: Joi.string().allow("").optional(),
      email: Joi.string().allow("").optional(),
    })
      .strict()
      .validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { propertyId } = req.body;
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
      return res.status(400).json({ error: "Invalid propertyId" });
    }

    const showing = new Showing(req.body);
    await showing.save();
    res.status(201).json({
      id: showing._id.toString(),
      propertyId: showing.propertyId.toString(),
      date: showing.date.toISOString(),
      clientName: showing.clientName,
      phone: showing.phone || null,
      email: showing.email || null,
    });
  } catch (err) {
    console.error("Error in /api/showings POST:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/showings/:id", async (req, res) => {
  try {
    const showing = await Showing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!showing) return res.status(404).json({ error: "Showing not found" });
    res.json(showing);
  } catch (err) {
    console.error("Error in /api/showings/:id PUT:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/showings/:id", async (req, res) => {
  try {
    const showing = await Showing.findByIdAndDelete(req.params.id);
    if (!showing) return res.status(404).json({ error: "Showing not found" });
    res.json({ message: "Showing deleted" });
  } catch (err) {
    console.error("Error in /api/showings/:id DELETE:", err);
    res.status(400).json({ error: err.message });
  }
});

// API endpoint for dashboard
app.get("/api/dashboard", async (req, res) => {
  try {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");
    const sales = await Property.find({
      sold: true,
      saleDate: { $gte: startDate, $lte: endDate },
    });

    const totalAmount = sales.reduce((sum, property) => sum + property.price, 0);
    const saleCount = sales.length;

    res.json({ totalAmount, saleCount });
  } catch (err) {
    console.error("Error in /api/dashboard:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));