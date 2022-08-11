// I have to import objects
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

//-----------------------------------------------READ ALL---------------------
router.get(`/`, async (req, res) => {
  const productList = await Product.find();
  //if I want a response with only name and image without id for instance
  //I have to add the SELECT method at the end
  //const productList = await Product.find().select(name image -_id);

  if (!productList) {
    res.status(500).json({ succes: false });
  }
  res.send(productList);
});

//-----------------------------------------------READ ONE---------------------
router.get(`/:id`, async (req, res) => {
  //populate is to get the detail of "category" in the same jason
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ succes: false });
  }
  res.send(product);
});

//-----------------------------------------------CREATE---------------------
router.post(`/`, async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) {
    res.status(500).send("The product cannot be created");
  }

  res.send(product);

  /*
  product
    .save()
    .then(createdProduct => {
      res.status(201).json(createdProduct);
    })
    .catch(err => {
      res.status(500).json({
        error: err,
        succes: false,
      });
    });*/
});

//-----------------------------------------------UPDATE---------------------
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid product id");
  }
  let category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json("The product cannot be updated");
  }
  res.send(product);
});

//-----------------------------------------------DELETE---------------------
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then(product => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The product is not found!" });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
