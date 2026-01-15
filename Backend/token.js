import jwt from "jsonwebtoken";

export const accesstoken = (userId,role)=>{
    return jwt.sign({id:userId,role},process.env.JWT_SECRET,{expiresIn:"15min"})
}
export const refreshtoken = (userId)=>{
    return jwt.sign({id:userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
}