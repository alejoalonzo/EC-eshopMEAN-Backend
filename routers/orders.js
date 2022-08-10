const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find();

  if (!OrderList) {
    res.status(500).json({ succes: false });
  }
  res.send(OrderList);
});

module.exports = router;
