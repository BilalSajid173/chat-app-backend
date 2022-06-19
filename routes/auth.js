const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");
const authControllers = require("../controllers/auth");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid email address")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email Already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 7 }),
    body("name").trim().not().isEmpty(),
  ],
  authControllers.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid email")
      .normalizeEmail(),
    body("password").trim().isLength({ min: 7 }),
  ],
  authControllers.login
);

module.exports = router;
