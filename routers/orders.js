const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const express = require("express");
const router = express.Router();

//-----------------------------------------------READ---------------------
router.get(`/`, async (req, res) => {
  const orderList = await Order.find();

  if (!OrderList) {
    res.status(500).json({ succes: false });
  }
  res.send(OrderList);
});

//-----------------------------------------------CREATE---------------------
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async orderItem => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;
  // console.log(orderItemsIdsResolved);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    coutry: req.body.coutry,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) {
    res.status(404).json("The order cannot be created");
  }
  res.send(order);
});

module.exports = router;

/*
 {
"orderItems": [
    {
        "quantity": 3,
        "product": "62f45bf1cc2af3ac0d5f5daa"
    },
     {
        "quantity": 2,
        "product": "62f549ebd09462b24bff24c1"
    }
],

"shippingAddress1": "660S Fernado Rd",
"shippingAddress2": "6589 Broadway Street",
"city": "Los Angeles",
"zip": "90065",
"country": "USA",
"phone" : "6666456598",
"user": "62f56d5846a0aa0b207f4ec7"

}*/
