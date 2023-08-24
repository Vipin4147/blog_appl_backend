const mongoose = require("mongoose");

const connection = mongoose.connect(
  "mongodb+srv://vipin:vipin@cluster0.k9v3sif.mongodb.net/blog_app?retryWrites=true&w=majority"
);

module.exports = {
  connection,
};
