var express = require("express");
var router = express.Router();
var userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");

// index page
router.get("/", async (req, res) => {
  const user = await userModel.find();
  res.render("index", { user });
});

// login page
router.get("/login", (req, res) => {
  res.render("login");
});

// signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});
// add projects page
router.get("/addProject", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("addProject", { user });
});

// profile page
router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("profile", { user });
});

// add project page
router.post(
  "/addProject",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.render("addProject", { error: "Select File" });
    } else {
      const { projectName, description, hostedUrl } = req.body;
      const file = req.file.filename;

      try {
        const user = await userModel.findOne({
          username: req.session.passport.user,
        });

        if (
          !req.body.description ||
          !req.body.projectName ||
          !req.body.hostedUrl
        ) {
          res.render("profile", { error: "Fill all fields" });
        }

        if (req.body.description.length < 10) {
          res.render("addProject", {
            error: "Description can't be less than 10 characters",
          });
        }

        // Get today's date and timestamp
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const formattedTime = today.toLocaleTimeString(); // Format: hh:mm:ss
        const hostedUrl = req.body.hostedUrl;
        user.projects.push({
          projectName,
          timestamp: formattedTime,
          date: formattedDate,
          hostedUrl,
          description,
          file,
        });

        // Save the updated user document
        await user.save();

        res.redirect("/profile");
      } catch (error) {
        // Handle any errors, possibly flash a generic message
        console.error("Error saving project:", error);
        res.render("addProject", {
          error: "Something went wrong. Please try again.",
        });
      }
    }
  }
);

// register route
router.post("/register", async (req, res) => {
  const { username, email, lastName } = req.body;

  const userData = new userModel({ username, email, lastName });
  userModel.register(userData, req.body.password, function (err) {
    if (err) {
      console.error(err);
      return res.redirect("/"); // Redirect on registration failure
    }

    passport.authenticate("local")(req, res, function () {
      console.log("done");
      return res.redirect("/profile"); // Redirect on successful registration
    });
  });
});

// login route

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  async function (req, res) {
    // Additional logic if needed
  }
);

// logout route
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// isLoggedIn middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
