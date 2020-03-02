// route for user authentication
const express = require('express');
const router = express.Router();
// using the bcryptJS npm package for password hashing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require("../middleware/auth");
const {
    check,
    validationResult
} = require('express-validator');

const User = require("../models/User");


// route to get a logged in user , will by privately accessed
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
});


// route to get a logged in user , it is a post request and privately accessed
router.post('/', [
    check('email', 'please include a valid email').isEmail(),
    check('password', 'password is required').exists()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    // destructuring the email and password variables from the request body
    const {
        email,
        password
    } = req.body;

    try { // saving one user to variable from DB using email
        let user = await User.findOne({
            email
        });
        // if there is no user then we return the error and status code
        if (!user) {
            return res.status(400).json({
                msg: "Invalid Credentials"
            });
        }
        //    using Bcrypt JS to compare the provided password to the user password
        const isMatch = await bcrypt.compare(password, user.password);
        // if it is not a match then we return the error message and status code
        if (!isMatch) {
            return res.status(400).json({
                msg: "Invalid Login"
            });
        }
        // this payload is used to be stored inside the JSON web token, it is the particular users ID
        const payload = {
            user: {
                id: user.id
            }
        }
        // using  json web token with the user id and the secret from the config file to sign the user in
        jwt.sign(payload, config.get('JWTsecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err)
                throw (err)


            res.json({
                token
            });
        });

    } catch (err) {
        console.error(err.message)
        res.status(500).send("server error")
    }

});

module.exports = router;