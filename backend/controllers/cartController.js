const Cart = require("../models/Cart");
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  const { userId, itemId, qty } = req.body;

  try {
    // Check if the cart item already exists for the user
    let cartItem = await Cart.findOne({ userId, itemId, ordered: false });

    if (cartItem) {
      // If the item already exists in the cart, update the quantity
      cartItem.qty += qty;
      const updatedCartItem = await cartItem.save();
      return res.status(200).json({
        message: "Cart item quantity updated",
        cartItem: updatedCartItem,
      });
    } else {
      // If the item does not exist in the cart, create a new cart item
      cartItem = new Cart({
        userId,
        itemId,
        qty,
        // ordered is false by default as defined in the model
      });

      const result = await cartItem.save();
      return res
        .status(201)
        .json({ cartId: result._id, message: "Item added to cart" });
    }
  } catch (error) {
    // Handle errors, like missing fields or invalid IDs
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

exports.showCart = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId); // Correctly instantiate ObjectId

  try {
    const cartItems = await Cart.aggregate([
      { $match: { userId: userId, ordered: false } }, // Match user's cart items that haven't been ordered
      {
        $lookup: {
          from: "items", // The collection to join
          localField: "itemId", // Field from the Cart collection
          foreignField: "_id", // Field from the Items collection
          as: "itemDetails", // Array of matching items
        },
      },
      { $unwind: "$itemDetails" }, // Deconstructs the array field from the joined documents
      {
        $project: {
          userId: 1,
          itemId: 1,
          name: "$itemDetails.name",
          qty: 1,
          price: "$itemDetails.price",
          photo: "$itemDetails.photo",
        },
      },
    ]);

    if (!cartItems.length) {
      return res.status(404).json({ message: "No items in your cart" });
    }

    res.status(200).json(cartItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart items", error: error.message });
  }
};

exports.removeCart = async (req, res) => {
  const { cartId } = req.params;
  const { all } = req.query;

  try {
    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    // Find the cart item by its ObjectId
    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Convert 'all' to a boolean if it is a string
    const removeAll = all === "true";

    if (removeAll || cartItem.qty === 1) {
      // Remove the cart item if 'all' is true or quantity is 1
      await Cart.findByIdAndDelete(cartId);
      return res.status(200).json({ message: "Cart item removed" });
    } else {
      // If quantity is greater than 1, decrement the quantity
      cartItem.qty -= 1;
      const updatedCartItem = await cartItem.save();
      return res.status(200).json({
        message: "Cart item quantity decreased",
        cartItem: updatedCartItem,
      });
    }
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Error removing cart item", error: error.message });
  }
};

exports.updateCart = async (req, res) => {
  const { cartId } = req.params;
  const { increment } = req.body;
  
  if (typeof increment !== "number" || increment <= 0) {
    return res.status(400).json({ message: "Invalid increment value" });
  }

  try {
    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.qty += increment;

    const updatedCartItem = await cartItem.save();

    res
      .status(200)
      .json({ message: "Cart item updated", cartItem: updatedCartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};
