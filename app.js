const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { ObjectId } = mongoose.Types;
const path = require("path");
const { listingSchema } = require("./schema.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport =require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

const ReviewRouter = require("./routes/review.js");
const ListingRouter = require("./routes/listing");
const UserRouter =require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlustn";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mySuperSecretCode",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },

};

app.get("/", (req, res) => {
  res.send("hi i am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res ,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", ListingRouter);
app.use("/listing", ListingRouter);
app.use("/listings/:id/reviews", ReviewRouter);
app.use("/", UserRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});



// app.get("/demoUser", async(req, res) =>{
//   let fakeUser = new user({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });
//   let registeredUser = await user.register(fakeUser,"helloWorld");
//   res.send(registeredUser);
// });