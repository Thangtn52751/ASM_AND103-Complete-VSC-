const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }

});

const cakeModel = mongoose.model('cake', cakeSchema);

module.exports = cakeModel;