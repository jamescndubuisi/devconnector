const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

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

// @route GET api/profile/all
// @description Get all profiles
// @access Public
router.get("/all", (req, res) => {
    const errors = {};
    Profile.find()
        .populate("user", ["name", "avatar"])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "There is no profiles";
                return res.status(404).json(errors);
            }
            res.json(profiles);
        })
        .catch(err => res.status(404).json({ profile: "There is no profiles" }));
});

// @route GET api/profile/user/:user_id
// @description Get profile by user_id
// @access Public

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

// @route Post api/profile/experience
// @description Add expeerience to profile
// @access Private
router.post(
    "/experience",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validateExperienceInput(req.body);
        console.log(isValid);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        Profile.findOne({ user: req.user.id }).then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            // add to experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
            // .catch(errors => res.json(errors));
        });
    }
);

// @route Post api/profile/education
// @description Add education to profile
// @access Private
router.post(
    "/education",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);
        // console.log(isValid);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        Profile.findOne({ user: req.user.id }).then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            // add to experience array
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
            // .catch(errors => res.json(errors));
        });
    }
);

// @route Delete api/profile/experience
// @description Delete experience from profile
// @access Private
router.delete(
    "/experience/:exp_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            //get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);
            console.log(removeIndex);
            console.log(req.params.exp_id);
            if (removeIndex === -1) {
                return res.status(404).json("Not found");
            } else {
                console.log(req.params.edu_id);
                // splice out of array
                profile.experience.splice(removeIndex, 1);
                console.log(profile);
                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => res.status(404).json(err));
                console.log("Deleted successfully");
            }
            // splice out of array
            profile.experience.splice(removeIndex, 1);
            profile
                .save()
                .then(profile => res.json(profile))
                .catch(err => res.status(404).json(err));
        });
    }
);

// @route Delete api/profile/education
// @description Delete education from profile
// @access Private
router.delete(
    "/education/:edu_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            //get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);
            console.log(removeIndex);
            if (removeIndex === -1) {
                return res.status(404).json("Not found");
            } else {
                console.log(req.params.edu_id);
                // splice out of array
                profile.education.splice(removeIndex, 1);
                console.log(profile);
                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => res.status(404).json(err));
                console.log("Deleted successfully");
            }
        });
    }
);

// @route Delete api/profile/education
// @description Delete education from profile
// @access Private
router.delete(
    "/education/:edu_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id }).then(() => {
            User.findOneAndRemove({ _id: req.user.id }).then(() =>
                res.json({ success: True })
            );
        });
    }
);

module.exports = router;