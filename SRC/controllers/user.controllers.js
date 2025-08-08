import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js"; 
import { CloudinaryFileUploader } from "../utils/cloudinary.utils.js";
import pkg from 'jsonwebtoken';
const {jwt} = pkg;
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, emailId, userName, password } = req.body;
  console.log(req.body)

  // Check for empty fields
  if ([fullName, emailId, userName, password].some(field => 
    field?.trim()=="")) {
    throw new ApiError(400, "All fields are required");
  }

  const userExists = await User.findOne({
    $or: [{ emailId }, { userName }]
  });

  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  const avatarFilePath = await req.files?.avatar[0]?.path
  const coverImageFilePath = await req.files?.coverImage[0]?.path
  if(!avatarFilePath){
    throw new ApiError(400,"Please upload avatar")
  }
  const avatar = await CloudinaryFileUploader(avatarFilePath)
  if(!avatar){
    throw new ApiError(500,"Server error during avatar upload")
  }
  const coverImage = await CloudinaryFileUploader(coverImageFilePath)
  const user = await User.create(
    {
      userName:userName.toLowerCase(),
      fullName,
      emailId,
      password,
      avatar:avatar.url,
      coverImage:coverImage?.url||""
    }
  )
  if(!user){
    throw new ApiError(500,"Something went wrong on server")
  }
  return res
  .status(200)
  .json(
    200,
    {user},
    "User registered successfully"
  )
});
const generateAccessaAndRefreshTokens = async (userId) => {
  try {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()
  user.refreshToken = refreshToken
  await user.save({validateBeforeSave:false})
  return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Couldn't generate access and refresh tokens")
  }
}
const loginUser = asyncHandler(async(req,res)=>{
  //input email or username and password
  //check if not exists throw error
  //check password
  //generate access and refresh tokens
  //cookies
  const {userName,emailId,password} = req.body
  if(!(userName || emailId)){
    throw new ApiError(400,"username or emailId required")
  }
  const user = await User.findOne({
    $or:[{userName},{emailId}]
  })
  if(!user){
    throw new ApiError(400,"User not found, Kindly register")
  }
  const matchPassword = await user.isPasswordCorrect(password)
  if(!matchPassword){
    throw new ApiError(400,"Password is incorrect")
  }
    const {accessToken,refreshToken} = await user.generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
    const options = {
      httpOnly: true,
      secure :true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,{
        user:loggedInUser,accessToken,refreshToken
      },
      "Successfully loggedIn"
    )
    )
})
const logoutUser = asyncHandler(async (req,res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
    $set:{
      refreshToken:undefined
    }
  },
  {
    new : true
  }
)
const options = {
      httpOnly: true,
      secure :true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"Loggedout successfully")
    )
})
const refreshAccessToken = asyncHandler(async (req,res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(400,"Unauthorized user")
  }
  const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user = User.findById(decodedToken._id)
  if(!user){
    throw new ApiError(401,"Unauthorized user")
  }
  if(incomingRefreshToken!=user?.refreshToken){
    throw new ApiError(401,"Tokens not match")
  }
  const {accessToken,newRefreshToken} = await generateAccessaAndRefreshTokens(user._id)
  const options = {
    httpOnly : true,
    secure : true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(200,{
    accessToken,newRefreshToken
  },"Access token refreshed")
  } catch (error) {
    throw new ApiError()
  }
})
const changePassword = asyncHandler(async (req, res) =>{
  const {oldPassword,newPassword} = req.body
  const user = await User.findById(req.user._id)
  const checkPassword = await user.isPasswordCorrect(oldPassword)
  if(!checkPassword){
    throw new ApiError(400,"Incorrect Password")
  }
  user.password = newPassword
  await user.save({validateBeforeSave: false})
  return res
  .res(200)
  .json(200,
    new ApiResponse({},
    "Password changed successfully"
  ))
})
const updateDetails = asyncHandler(async(req,res)=>{
  const {fullName,emailId} = req.body
  if(!(fullName||emailId)){
    throw new ApiError(400,"Fullname or emailId required")
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        emailId
      }
    },
    {new: true}
  ).select("-password")
  return res(200)
  .json(200,
    {user},
    "User details successfully updated"
  )
})
const updateAvatar = asyncHandler(async(req,res)=>{
  const avatarFilePath = await req.file?.path
  if(!localAvatarPath){
    throw new ApiError(400,"No avatr found")
  }
  const avatar = await CloudinaryFileUploader(avatarFilePath);
  if(!avatar.url){
    throw new ApiError(500,"File upload failed, server error")
  }
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{avatar:avatar.url}
    }
    ,{new:true}
  ).select("-password")
  return res(200)
  .json(200,
    {},
    "User details successfully updated"
  )
})
const updateCoverImage = asyncHandler(async(req,res)=>{
  const coverImageFilePath = await req.file?.path
  if(!localCoverImagePath){
    throw new ApiError(400,"No avatr found")
  }
  const coverImage = await CloudinaryFileUploader(coverImageFilePath);
  if(!coverImage){
    throw new ApiError(500,"File upload failed, server error")
  }
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{coverImage:coverImage.url}
    }
    ,{new:true}
  ).select("-password")
  return res(200)
  .json(200,
    {},
    "User details successfully updated"
  )
})
export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
  updateDetails,
  updateAvatar,
  updateCoverImage
};
