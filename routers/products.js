// I have to import objects
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");

//-----------------------------------------------STORAGE IMAGES---------------------
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-"); //replace empty spaces with dashes
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //cb(null, file.fieldname + '-' + uniqueSuffix)
  },
});

const uploadOptions = multer({ storage: storage });

//-----------------------------------------------READ ALL---------------------
router.get(`/`, async (req, res) => {
  //filter by category
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  console.log(filter);
  const productList = await Product.find(filter).populate("category");
  //if I want a response with only name and image without id for instance
  //I have to add the SELECT method at the end
  //const productList = await Product.find().select(name image -_id);
  //console.log(filter);
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

//-----------------------------------------------GET COUNTS---------------------
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments()
    .then(count => {
      if (count) {
        return res.status(200).json({ productCount: count });
      } else {
        return res.status(500).json({ succes: false });
      }
    })
    .catch(err => {
      return res.status(400).json({ succes: false, error: err });
    });
});

//-----------------------------------------------GET FEATURED---------------------
router.get(`/get/featured/:count`, async (req, res) => {
  // the next like works like IF and ELSE
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({ succes: false });
  }
  res.send(products);
});

//-----------------------------------------------CREATE---------------------
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }

  const file = req.file;
  if (!file) {
    return res.status(400).send("There isnot image in the request");
  }

  const fileName = req.file.filename;

  //http://127.0.0.1:3000/api/v1/public/upload
  const basePath = `${req.protocol}://${req.get("host")}/public/upload`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //http://127.0.0.1:3000/api/v1/public/upload/image-55625
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

//-----------------------------------------------UPLOAD GALLERY IMAGES------
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10), //maximun 10 files in this case
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid product id");
    }

    const files = req.files;
    let imagesPaths = [];

    //http://127.0.0.1:3000/api/v1/public/upload
    const basePath = `${req.protocol}://${req.get("host")}/public/upload`;

    if (files) {
      files.map(file => {
        imagesPaths.push(`${basePath}${file.fileName}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) {
      res.status(500).json("The product cannot be updated");
    }
    res.send(product);
  }
);

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
