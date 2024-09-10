function genrateUniqueCode(){
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let code = ""
    const charactersLength = characters.length
    for (let index = 0; index < 8; index++) {
        const indexNumber = Math.floor(Math.random()*charactersLength)
        code += characters[indexNumber]
    }
    return code
}

module.exports = genrateUniqueCode