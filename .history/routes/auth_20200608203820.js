const express = require('express');
const {check,body} = require("express-validator");
const authController = require('../controllers/auth');
const User = require("../models/user");

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please ener a valid email.").normalizeEmail(),
    body("password", "Password has to be valid")
    .isLength({min:5}).isAlphanumeric().trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // if (value === "tshikha634@gmail.com") {
        //   throw new Error("This email is forbidden");
        // }
        // return true;
        return User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
         return Promise.reject("Email is already xists .Please pick another one.");
      }
    })
      }).normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
    body("confirmPassword")
    .custom((value,{req}) => {
      console.log(value,req.body.password)
      if(value !== req.body.password){
        throw new Error("Password should match.");
      }
      return true;
    })
  ],
  authController.postSignup
);
  
router.post('/logout', authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset",authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;