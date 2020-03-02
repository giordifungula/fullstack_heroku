//  route file for user 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator');

const User = require("../models/User");

// route to register a new user, it is a post request and is publicly accessed
router.post('/', [

    // using express validator package to do checks on various login fields
    check('name', 'name is required').not().isEmpty(),
    // validating email
    check('email', 'Please include a valid email').isEmail(),
    // checking password length
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
    // using the result of the validation , checking if there are no errors, if there are then we send error status and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    // saving user to variable from the request body
    const {
        name,
        email,
        password
    } = req.body;

    try {
        // using async await to fetch one user from DB by email
        let user = await User.findOne({
            email
        })
        if (user) {
            return res.status(400).json({
                msg: 'User already exists!'
            })
        }
        // saving new user to DB
        user = new User({
            name,
            email,
            password
        });
        //   using the bcryptjs package to hash password using salt genrator method and hash method
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        // saving user to DB

        await user.save();


        // sending the user id as a payload to use inside the json web token
        const payload = {
            user: {
                id: user.id
            }
        }
        //   using JWT to sign the user in , using the secret within the config file
        jwt.sign(payload, config.get('JWTsecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw (err)
            // responds by assigning a token to a specific user
            res.json({
                token
            });
        });

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

module.exports = router;