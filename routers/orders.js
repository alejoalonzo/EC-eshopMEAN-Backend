const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const express = require("express");
const router = express.Router();

//-----------------------------------------------READ ALL ORDERS---------------------
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 }); //sort from de newst to olders, without '-1' is reverse

  if (!orderList) {
    res.status(500).json({ succes: false });
  }
  res.send(orderList);
});

//-----------------------------------------------READ ONE ORDER by ID---------------------
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    //to get more details about the data inside order (DB Relational)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ succes: false });
  }
  res.send(order);
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

//-----------------------------------------------UPDATE---------------------
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    res.status(404).json("The order cannot be updated");
  }
  res.send(order);
});

//-----------------------------------------------DELETE---------------------
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(order => {
      if (order) {
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The order is not found!" });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});
