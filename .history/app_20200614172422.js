const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://shikha:TJzWOjuZ3A3X9YXd@cluster0-9bgjs.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null, "images");
  },
  filename : (req,file,cb) => {
    cb(null,new Date().toISOString() + "_" + file.originalname)
  }
});

const fileFilter = (req,file,cb) => {
  if(file.mimetype === "image/png" ||
  file.mimetype === "image/jpg" || 
  file.mimetype === "image/jpeg"){
    cb(null,true);
  }else{
    cb(null,false);
  }
}
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
//urlencoded data is basically for txt field 
//we are unable to extract image ata as it is binary data
app.use(bodyParser.urlencoded({ extended: false }));
//multere is extract image, and we are using image as our field in the form is image and in single file
app.use(multer({ storage : fileStorage,fileFilter : fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
//SESSION MIDDLEWARE IS INITTILAIZED TO USE THE SESSION. wE USE THIRD PARTY LIKE EXRESS-SESSION
//RESAVE WE PUT AS A FALSE SO THAT AFTER ANY INPUT IT WILL NOT CHANGE
//secret signing the hash which is secretly to store the id,we are keeping as string
//resave : only if something change in the session,every response and change
//saveUnintialized : ensure tht no session will save unless it require a change
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());
// app.use((req, res, next) => {
//   User.findById('5bab316ce0a7c75f783cb8a8')
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error("Sync dimmy");
    if(!req.session.user){
      return next();
    }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
     next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500",errorController.get500);
app.use(errorController.get404);

app.use((error,req,res,next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
})

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: "Shikha",
    //       email: "shikha@monocept.com",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
