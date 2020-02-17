const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//profile model
const Profile = require("../../models/Profile");

//user model
const User = require("../../models/User");

// @route Post api/profile/test
// @description tests route
//@ access Public
router.get("/test", (req, res) => res.json({ message: "Hello profile" }));

// @route Post api/profile
// @description get current users profile
//@ access Private

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const errors = {};
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                console.log(profile);
                if (!profile) {
                    errors.noprofile = "No profile found";
                    return res.status(404).json(errors);
                }
                res.status(200).json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);

module.exports = router;