const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  qty: { type: Number, required: true },
  status: { type: String, required: true, default: "Pending" },
});

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
