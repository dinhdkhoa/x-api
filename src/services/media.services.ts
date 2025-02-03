import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { UserRequest } from '~/models/schemas/user.schema'
import fs from 'fs'

const uploadsFolderPath = path.resolve('uploads/images')

const uploadFile = async (req: Request<{}, {}, UserRequest>, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: uploadsFolderPath,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 700 * 1024 //300kb
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ fields, files })
  })
}

const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/images')
const UPLOAD_VIDEO_TEMP_DIR = path.resolve('uploads/videos')
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // mục đích là để tạo folder nested
      })
    }
  })
}

export const MediaService = {
  uploadFile
}

