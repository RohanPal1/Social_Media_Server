const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: {
        type: String,  
        required: true 
    },
    bio: {
        type: String,
    },
    avatar: {
        publicID: String,
        url: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    following : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
}, {
    timestamps: true
});


module.exports = mongoose.model('user', userSchema);