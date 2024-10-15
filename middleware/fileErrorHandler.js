function fileErrorHandler(error,req,res,next){
if(error.message==="Only images are allowed!"){
res.status(500).json({msg:"Only images are allowed!"})
}
next()
}

module.exports = fileErrorHandler