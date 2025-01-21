require("dotenv/config");
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const bearerToken = require("express-bearer-token");
const mongoose = require("mongoose");

const serviceAccount = JSON.parse(process.env.GOOGLE_API_CREDS);
admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "db-monies"
  })
  .then(() => {
    console.log("Mongoose Connected");
  });

app.use(fileUpload());
app.use(bearerToken());
app.use(express.json());

const routes = require("./routes");
app.use(routes);

// app.listen(port, () => console.log(`App listening on port ${port}!`));
module.exports = app;
