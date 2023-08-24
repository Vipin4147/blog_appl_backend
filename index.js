const express = require("express");

const cors = require("cors");

const { connection } = require("./config/db.js");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const { UserModel } = require("./model/usermodel.js");

const { BlogModel } = require("./model/blogmodel.js");
const { authenticate } = require("./middleware/authenticate.js");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    res.send("welcome user");
  } catch (error) {
    console.log("err", error);
  }
});

let username;

app.post("/register", async (req, res) => {
  try {
    const { username, avatar, email, password } = req.body;

    const user = await UserModel.find({ email });

    if (user.length > 0) {
      res.send({ msg: "already registered please login" });
    } else {
      bcrypt.hash(password, 6, async (err, hashed_pass) => {
        if (err) {
          console.log(err);
          res.send("err", err);
        }
        const n_user = await new UserModel({
          username,
          avatar,
          email,
          password: hashed_pass,
        });
        n_user.save();
        res.send({ msg: "user registered successfully" });
      });
    }
  } catch (error) {
    console.log("err", error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await UserModel.find({ email });
    console.log(user);
    if (user.length > 0) {
      const hashed_pass = await bcrypt.compare(password, user[0].password);
      if (!hashed_pass) {
        console.log("Invalid Credential");
        // alert("login failed");
        res.send({ msg: "login failed", ms2: "incorrect password" });
      } else {
        const token = jwt.sign({ user: user[0] }, "masai");
        // const decoded = jwt.verify(token, "masai");
        // console.log(decoded);
        // alert("login successful");
        const decoded = jwt.verify(token, "masai");
        username = decoded;
        console.log(decoded);
        res.send({ msg: "login successful", token, decoded });
      }
    }
  } catch (error) {
    console.log("err", error);
  }
});

app.get("/blogs", authenticate, async (req, res) => {
  try {
    if (username == undefined) {
      res.send({ msg: "Please login first" });
    }
    let title = req.query.title;
    let category = req.query.category;
    let srt = req.query.sort;
    let order = req.query.order;
    if (title) {
      const blogs = await BlogModel.find({ title: title });
      res.send(blogs);
    } else if (category) {
      const blogs = await BlogModel.find({ category: category });
      res.send(blogs);
    } else if (srt && order) {
      if (order == "asc") {
        const blogs = await BlogModel.find().sort({ srt: 1 });
        res.send(blogs);
      } else if (order == "desc") {
        const blogs = await BlogModel.find().sort({ srt: -1 });
        res.send(blogs);
      }
    } else {
      const blogs = await BlogModel.find();
      res.send(blogs);
    }
  } catch (error) {
    console.log("err", error);
  }
});

app.post("/blogs", authenticate, async (req, res) => {
  try {
    const { username, title, content, category } = req.body;
    const date = Date.now();
    const likes = 0;
    const comments = [];

    const blog = await BlogModel({
      username,
      title,
      content,
      category,
      date,
      likes,
      comments,
    });

    blog.save();
    res.send({ msg: "blog created successfully" });
  } catch (error) {
    console.log("err", error);
  }
});

app.patch("/blogs/:id", authenticate, async (req, res) => {
  try {
    const payload = req.body;
    const ID = req.params.id;
    const blog = await BlogModel.findByIdAndUpdate(ID, payload);
    res.send({ msg: "data edited successfully" });
  } catch (error) {
    console.log("err", error);
  }
});

app.delete("blogs/:id", authenticate, async (req, res) => {
  try {
    const ID = req.params.id;
    const blog = await BlogModel.findByIdAndDelete(ID);
    res.send({ msg: "Blog deleted successfully" });
  } catch (error) {
    console.log("err", error);
  }
});

app.patch("/blogs/:id/like", authenticate, async (req, res) => {
  try {
    const ID = req.params.id;
    const payload = (await BlogModel.findById(ID).likes) + 1;
    const blog = await BlogModel.findByIdAndUpdate(ID, { likes: payload });
    res.send({ msg: "liked successfully" });
  } catch (error) {
    console.log("err", error);
  }
});

app.patch("/blogs/:id/comment", authenticate, async (req, res) => {
  try {
    const ID = req.params.id;
    const payload = req.body;
    const blog = await BlogModel.findByIdAndUpdate(ID, payload);
    res.send({ msg: "commented successfully" });
  } catch (error) {
    console.log("err", error);
  }
});

app.listen(5100, async () => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log("err", error);
  }

  console.log("running at 5100");
});
