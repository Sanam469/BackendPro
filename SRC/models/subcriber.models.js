import mongoose,{Schema} from "mongoose";
const subscriberSchema = new Schema(
    {
        id:{
            type: String,
            required: true,
        },
        creator:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps:true})
export const Subscriber = mongoose.model("Subscriber",subscriberSchema)