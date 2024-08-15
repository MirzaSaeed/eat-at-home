const Item = require("../models/Item");

exports.showItems = async (req, res) => {
  try {
    // Retrieve all items from the database
    const items = await Item.find({});
    // Respond with the array of items
    res.status(200).json(items);
  } catch (error) {
    // Handle errors during retrieval
    res.status(500).json({ message: "Error retrieving items" });
  }
};

exports.showItem = async (req, res) => {
  try {
    // Retrieve a specific item by ID from the database
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    // Respond with the found item
    res.status(200).json(item);
  } catch (error) {
    // Handle potential errors, like invalid ID format
    res.status(500).json({ message: "Error retrieving item" });
  }
};

exports.getItemsByCategory = async (req, res) => {
  try {
    // Extract the category from the URL parameter
    const category = req.params.category;

    // Find items that have the requested category
    const items = await Item.find({ category: category });

    // If no items found, return an empty array
    if (!items.length) {
      return res
        .status(404)
        .json({ message: "No items found in this category" });
    }

    // Return the found items
    res.json(items);
  } catch (error) {
    // Handle potential errors
    res
      .status(500)
      .json({
        message: "Error fetching items by category",
        error: error.message,
      });
  }
};
