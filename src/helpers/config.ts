import { diskStorage } from "multer";

export const storageConfig = (folder: string) => diskStorage({
    destination: `uploads/${folder}`,
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + file.originalname)
    }
})