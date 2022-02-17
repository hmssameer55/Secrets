
const {Schema,model}= require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const passportLocalMongoose = require('passport-local-mongoose') //additions

const userSchema = new Schema({
   username:{
       type:'string'
   },
   password:{
       type:"string"
   },
   googleId:{
       type:"string"
   },
   secret:{
       type:[]
   }
})

userSchema.plugin(passportLocalMongoose)  //additions
userSchema.plugin(findOrCreate)

const userModel= model('userslist',userSchema)




module.exports= userModel