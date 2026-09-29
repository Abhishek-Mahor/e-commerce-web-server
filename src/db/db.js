const mongoose = require('mongoose');


function connectDB() {  
    return mongoose.connect(process.env.DATABASE_URL)
        .then(() => {
            console.log('Connected to MongoDB');
        });
}

module.exports = connectDB;
