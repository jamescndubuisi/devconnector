const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");
const passport = require("passport");
//load  inputs validation

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

router.get("/test", (req, res) => res.json({ message: "Hello users" }));

// @route Post api/users/register
// @description registers user
//@ access Public
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "Email exists" });
        } else {
            const avatar = gravatar.url(req.body.email, {
                r: "pg",
                s: "200",
                d: "mm"
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// @route Post api/users/login
// @description logs user in
//@ access Public

router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    User.findOne({ email }).then(user => {
        // user check
        console.log(user);
        if (!user) {
            errors.email = "user does not exist";
            return res.status(404).json(errors);
        }
        // if user found, check for password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // res.json({ msg: "Success" });
                // user matched
                //sign token
                //create jwt payload
                const payload = { id: user.id, name: user.name, avatar: user.avatar };

                jwt.sign(
                    payload,
                    keys.secretOrprivatekey, { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                errors.password = "Password incorrect";
                return res.status(400).json(errors);
            }
        });
    });
});

// @route Get api/users/current
// @description Returns current User
//@ access Private

router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        });
    }
);

module.exports = router;