const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const {
    check,
    validationResult
} = require('express-validator');

const User = require("../models/User");
const Pokemon = require("../models/Pokemon");


// route to get all a users pokemon, it is a get request and is privately accessed by individual users
router.get('/', auth, async (req, res) => {
    try {
        // getting all pokemon from DB by user id
        const pokemon = await Pokemon.find({
            user: req.user.id
        }).sort({
            date: -1
        })
        res.json(pokemon)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
});


// route to post a new pokemon, it is a post request and privately accessed
router.post('/', [auth, [
    // using the middleware to do checks for authentication
    check("name", "Name required").not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    // saving the pokemon data to a variable from the request body
    const {
        name,
        type,
        HP,
        attack,
        defense,
        image,
    } = req.body;

    try {
        // saves a new pokemon to DB using the previously instantiated variable
        const newPokemon = new Pokemon({
            name,
            type,
            HP,
            attack,
            defense,
            image,
            user: req.user.id
        });

        const pokemon = await newPokemon.save();
        res.json(pokemon)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
});

// route to update a pokemon, it is a put requestAnimationFrame, uses the router and auth middleware and is private
router.put('/:id', auth, async (req, res) => {
    const {
        name,
        type,
        HP,
        attack,
        defense,
        image,
    } = req.body;
    // build pokemon object
    const pokemonFields = {};
    if (name) pokemonFields.name = name;
    if (type) pokemonFields.type = type;
    if (HP) pokemonFields.HP = HP;
    if (attack) pokemonFields.attack = attack;
    if (defense) pokemonFields.defense = defense;
    if (image) pokemonFields.image = image;


    try {
        // using the id parameter to find the specific pokemon
        let pokemon = await Pokemon.findById(req.params.id)
        if (!pokemon) return res.status(404).json({
            msg: 'Pokemon not found :('
        });
        // make sure that the current user owns this pokemon
        if (pokemon.user.toString() != req.user.id) {
            return res.status(401).json({
                msg: "You are not authorized to edit this Pokemon."
            })
        }

        pokemon = await Pokemon.findByIdAndUpdate(req.params.id, {
            $set: pokemonFields
        }, {
            new: true
        });
        res.json(pokemon)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
});


// route to delete a pokemon , it is a delete request, and is done by a specific ID
router.delete('/:id', auth, async (req, res) => {
    try {
        // getting specific pokemon from DB by id
        let pokemon = await Pokemon.findById(req.params.id)
        if (!pokemon) return res.status(404).json({
            msg: 'Pokemon not found :('
        });
        // make sure that the current user owns this pokemon by checking user id 
        if (pokemon.user.toString() != req.user.id) {
            return res.status(401).json({
                msg: "You are not authorized to edit this Pokemon."
            })
        }

        await Pokemon.findByIdAndRemove(req.params.id);

        res.json({
            msg: "Pokemon deleted successfully"
        })

        res.json(pokemon)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
});


module.exports = router;