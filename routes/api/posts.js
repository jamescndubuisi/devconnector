const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");

// validation
const validatePostInput = require("../../validation/post");

router.get("/test", (req, res) => res.json({ message: "Hello posts" }));

// @route       Post api/post/
// @description Creates Posts
// @access      Private

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);
        console.log(isValid);
        //check validation
        if (!isValid) {
            // if any errors
            return res.status(400).json(errors);
        }

        const newPost = new Post({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.name,
            user: req.user.id
        });
        newPost.save().then(post => res.json(post));
    }
);

module.exports = router;