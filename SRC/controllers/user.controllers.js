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

  const avatarFilePath = req.files?.avatar[0]?.path;
  //const coverImageFilePath = req.files?.coverImage[0]?.path;
  let coverImageFilePath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageFilePath = req.files.coverImage[0].path
  }
//console.log(req.files)
//console.log(req.files.avatar)
  if (!avatarFilePath) {
    throw new ApiError(400, "Please upload Avatar");
  }

  // Upload to Cloudinary
  const avatar = await CloudinaryFileUploader(avatarFilePath);
  const coverImage = await CloudinaryFileUploader(coverImageFilePath)
  if(!avatar){
    throw new ApiError(400,"Avatar not found")
  }
  // Create user
  const user = await User.create({
    fullName,
    emailId,
    userName: userName.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User created successfully")
  );
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
    throw new ApiError(401,"")
  }
  if(incomingRefreshToken!=user?.refreshToken){
    throw new ApiError(401,"")
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

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};
