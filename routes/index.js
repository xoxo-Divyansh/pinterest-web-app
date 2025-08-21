const express = require("express");
const router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const post = require("./post");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

router.get("/profile", isLogedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  console.log(user);
  res.render("profile", { user, nav: true });
});

router.get("/feed", async (req, res) => {
  try {
    const posts = await post.find().populate("user").sort({ date: -1 });
    res.render("feed", { posts, nav: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/add", isLogedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { user, nav: true });
});

router.post(
  "/createpost",
  isLogedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    try {
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });
      const post = await postModel.create({
        user: user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.file.filename,
      });

      user.posts.push(post._id);
      await user.save();
      res.redirect("/profile");
    } catch (err) {
      console.error("Error is /createpost:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/fileupload",
  isLogedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });
  userModel.register(data, req.body.password).then((registereduser) => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // console.log('Login attempt:', { err, user, info })
    if (err) return next(err);
    if (!user) {
      console.log("Authentication failed:", info);
      return res.redirect("/");
    }
    req.login(user, (err) => {
      if (err) return next(err);
      // console.log('User logged in:', user)
      return res.redirect("/profile");
    });
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLogedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
