const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      require: true,
    },
  ],
  shippingAddress1: {
    type: String,
    requir: true,
  },
  shippingAddress2: {
    type: String,
    requir: true,
  },
  city: {
    type: String,
    requir: true,
  },
  zip: {
    type: String,
    requir: true,
  },
  country: {
    type: String,
    requir: true,
  },
  phone: {
    type: String,
    requir: true,
  },
  status: {
    type: String,
    requir: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    requir: true,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

//Changing the "id" instead of "_id"
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);
