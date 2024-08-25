const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");


router.get("/Signup", (res,req) => {
    res.render("users/Signup.ejs");
});

router.post("/Signup", wrapAsync(async(req,res)=> {
    try{
        let {username, email, password} = req.body;
        const newUser =new User({email,username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to WanderLust");
        res.redirect("/listings");
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/Signup");
    }

}));

module.exports = router;