import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import { JsonWebTokenError } from "jsonwebtoken"
const userSchema = new Schema(
    {
        userName:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true //important for searching
        },
        emailId:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true //important for searching
        },
        password:{
            type: String,
            required: [true,"Password is required"],
        },
        refreshToken:{
            type: String,
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        coverImage:{
            type: String, //cloudnary url
        },
        avatar:{
            type: String //cloudnary url
        }
    }
    ,{timestamps:true})
    userSchema.pre("save",async function(next){
        if(!this.isModified("password")) return next();
        this.password = bcrypt.hash(this.password,10)
        next();
    })
    userSchema.methods.isPasswordCorect= async function name(password){
    return await bcrypt.compare(password,this.password) //bool
}
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.ACCESS_REFRESH_SECRET,
    {
      expiresIn: process.env.ACCESS_REFRESH_EXPIRY
    }
  );
};

export const User = mongoose.model("User",userSchema)