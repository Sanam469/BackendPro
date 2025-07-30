import {v2, cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret
});
const CloudinaryFileUploader = async function(localFilePath){
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                response_type : "auto"
            })
            console.log(`File uploaded successfully on cloudinary from server,${response.url}`)
        return response;
    } catch (error) {
        fs.unlink(localFilePath) //remove all local files temperorily stored on cloudinary as upload failed
        return null
    }
}
export {CloudinaryFileUploader}