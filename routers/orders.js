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

  //CALCULATING TOTAL PRICE-------------------------------------------
  //totalPrices is an Array of totalPrice
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async orderItemId => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  //console.log(totalPrices);

  //combine every item price and plus element in array
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  //--------------------------------------------------------------------

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    coutry: req.body.coutry,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) {
    res.status(404).json("The order cannot be created");
  }
  res.send(order);
});

module.exports = router;

//-----------------------------------------------GET TOTAL ESHOP SALES------
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

//-----------------------------------------------GET COUNTS---------------------
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments()
    .then(count => {
      if (count) {
        return res.status(200).json({ orderCount: count });
      } else {
        return res.status(500).json({ succes: false });
      }
    })
    .catch(err => {
      return res.status(400).json({ succes: false, error: err });
    });
});

//-----------------------------------------------GET USER ORDERS---------------------
router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 }); //sort from de newst to olders, without '-1' is reverse

  if (!userOrderList) {
    res.status(500).json({ succes: false });
  }
  res.send(userOrderList);
});

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
    .then(async order => {
      //Delete order items inside of Order--------------------
      if (order) {
        await order.orderItems.map(async orderItem => {
          await OrderItem.findByIdAndRemove(orderItem);
        }); //-------------------------------------------------
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
