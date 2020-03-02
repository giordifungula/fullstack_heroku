const mongoose = require('mongoose');

const PokeSchema = mongoose.Schema({


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,

    },
    HP: {
        type: Number,
        required: true
    },
    attack: {
        type: Number,
        required: true
    },
    defense: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
});


module.exports = mongoose.model('pokemon', PokeSchema);