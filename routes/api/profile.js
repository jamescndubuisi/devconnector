const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const validateProfileInput = require("../../validation/profile");

//profile model
const Profile = require("../../models/Profile");

//user model
const User = require("../../models/User");

// @route Post api/profile/test
// @description tests route
// @access Public
router.get("/test", (req, res) => res.json({ message: "Hello profile" }));

// @route Post api/profile
// @description get current users profile
// @access Private

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const errors = {};
        Profile.findOne({ user: req.user.id })
            .populate("user", ["name", "avatar"])
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

// @route GET api/profile/handle/:handle
// @description Get profile by handle
// @access Private

router.get("/handle/:handle", (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route GET api/profile/user/:user_id
// @description Get profile by user_id
// @access Private

router.get("/user/:user_id", (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err =>
            res.status(404).json({ profile: "There is no profile for this user" })
        );
});

// @route Post api/profile
// @description create user profile
// @access Private
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // get fields
        const { errors, isValid } = validateProfileInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const profileFields = {};
        profileFields.user = req.user.id;
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubusername)
            profileFields.githubusername = req.body.githubusername;
        // skills to be split into an array
        if (typeof req.body.skills !== "undefined") {
            profileFields.skills = req.body.skills.split(",");
        }
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

        Profile.findOne({ user: req.user.id }).then(profile => {
            if (profile) {
                //update
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(profile => res.json(profile));
            } else {
                // create
                // check if handle has been taken
                Profile.findOne({ handle: profileFields.handle }).then(profile => {
                    if (profile) {
                        errors.handle = "Handle already exists";
                        res.status(400).json(errors);
                    }
                    //save
                    new Profile(profileFields).save().then(profile => res.json(profile));
                });
            }
        });
    }
);

module.exports = router;