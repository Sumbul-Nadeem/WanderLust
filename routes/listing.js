const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};

// Index Route - Show all listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });

}));

// New Route - Form to create a new listing
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route - Show a specific listing by ID
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
    
}));

// Create Route - Add a new listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "new listing created!");
    res.redirect("/listings");
}));

// Edit Route - Form to edit a listing by ID
router.get("listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}));

// Create Route - Add a new listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route - Form to edit a listing by ID
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
}));

// update route 
router.put("/:id",validateListing,
    wrapAsync (async (req, res) => {
       if(!req.body.listing) {
       throw new ExpressError(400, "Send valid Data For Listing.");
       }
       let { id } = req.params;
       // Trim the id and check if it's a valid ObjectId
       id = id.trim();     
       await Listing.findByIdAndUpdate(id, { ...req.body.listing });
       res.redirect("/listings");
}));

// Delete Route - Delete a specific listing by ID
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
