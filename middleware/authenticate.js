const express = require("express");

// const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.send({ msg: "please login first" });
  } else {
    next();
  }
};

module.exports = {
  authenticate,
};
