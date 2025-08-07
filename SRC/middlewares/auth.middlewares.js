import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
export const verifyJwt  = asyncHandler(async (req,_,next) => {
    try {
    const token = req.cookies?.accessToken || req.header("Authoriztion")?.replace("B earer ","")
    if(!token){
        throw new ApiError(401,"Unauthorized user")
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = User.findById(decodedToken._id).select(
    "-password -refreshToken"
    )
    req.user = user
    next()
}
catch (error) {
        throw new ApiError(500,"Invalid tokens")
    }
})