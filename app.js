const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv/config");

//Cors
app.use(cors());
app.options("*", cors());

//Middleware
app.use(express.json());
app.use(morgan("tiny"));

//Routers
const categoriesRoutes = require("./routers/categories");
const productsRoutes = require("./routers/products");
const userRoutes = require("./routers/users");
const orderRoutes = require("./routers/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, orderRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connection to database is ready...");
  })
  .catch(err => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("Server is running http://127.0.0.1:3000");
});
