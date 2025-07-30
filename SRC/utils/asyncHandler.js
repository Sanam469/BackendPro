const asyncHandler = (func)  =>{
    return (req,res,next) =>{
    Promise.resolve(func(req,res,next)).
    reject((err)=>next(err))
    }
}
export {asyncHandler}