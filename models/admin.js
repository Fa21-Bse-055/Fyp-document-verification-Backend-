const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String,enum:["super-admin","admin"] ,default:"admin" }
})

module.exports = mongoose.model("admin", adminSchema)