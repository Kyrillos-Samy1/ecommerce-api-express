const mongoose = require("mongoose");

//! Connect With DB
const dbConnection = () => {
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then((connect) =>
      console.log(`Database Connected: ${connect.connection.host}`)
    );
};

module.exports = dbConnection;
