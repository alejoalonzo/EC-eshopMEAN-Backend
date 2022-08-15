const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//-----------------------------------------------READ ALL USERS---------------------
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ succes: false });
  }
  res.send(userList);
});

//-----------------------------------------------READ ONE USER---------------------
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID is not found" });
  }
  res.status(200).send(user);
});

//-----------------------------------------------GET COUNTS---------------------
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments()
    .then(count => {
      if (count) {
        return res.status(200).json({ userCount: count });
      } else {
        return res.status(500).json({ succes: false });
      }
    })
    .catch(err => {
      return res.status(400).json({ succes: false, error: err });
    });
});

//-----------------------------------------------CREATE---------------------
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    //For every async operation, we have to await
    passwordHash: await bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    number: req.body.number,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) {
    res.status(404).json("The user cannot be created");
  }
  res.send(user);
});

//-----------------------------------------------REGISTER---------------------

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: await bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    number: req.body.number,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) {
    res.status(404).json("The user cannot be created");
  }
  res.send(user);
});

//-----------------------------------------------LOGIN---------------------
router.post("/login", async (req, res) => {
  const secret = process.env.SECRET;
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send("The user not found");
  }
  if (user && bcrypt.compare(req.body.passwordHash, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).send({ user: user.email, token: token });
  } else {
    return res.status(400).send("The password is wrong!");
  }
});

//-----------------------------------------------UPDATE USER---------------------
router.put("/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = await bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      number: req.body.number,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  if (!user) {
    res.status(404).json("The user cannot be updated");
  }
  res.send(user);
});

//-----------------------------------------------DELETE---------------------
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then(user => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The user is not found!" });
      }
    })
    .catch(err => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
