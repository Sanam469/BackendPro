import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new Schema(
    {
        title:{
            type:String,
            required:[true,"Please enter the title"]
        },
        description:{
            type:String,
            required:[true,"Please enter the description"]
        },
        creater:[
            {
                type: Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        thumbnail:{
            type: String, //cloudnaryUrl
            required: true
        },
        videoFile:{
            type: String, //cloudnaryUrl
            required: true
        },
        views:{
            type:Number,
            default: zero
        },
        duration:{
            type: Number, //cloudnaryUrl
            required: true
        }
    }
    ,{timestamps:true})
    videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)