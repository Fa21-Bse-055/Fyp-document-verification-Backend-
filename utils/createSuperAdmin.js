const bcrypt = require("bcrypt")
const Admin = require("../models/admin")
function createSuperAdmin(){
const hash = bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash("superadmin@123",salt,async (err,hash)=>{
        await Admin.create({
            username : "superadmin",
            password:hash,
            email:"ahmaranwar24@gmail.com",
            role: "super-admin"
        })
        console.log("Super Admin Created"); 
    })
})
}

module.exports = createSuperAdmin