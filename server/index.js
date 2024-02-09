require("dotenv/config");
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "db-monies",
  })
  .then(() => {
    console.log("Mongoose Connected");
  });

const port = process.env.PORT || 3005;

app.use(fileUpload());

app.use(express.json());

const routes = require("./routes");
app.use(routes);

// app.listen(port, () => console.log(`App listening on port ${port}!`));
module.exports = app;
