import { NextFunction, Request, Response } from 'express'
import formidable, { errors as formidableErrors } from 'formidable'
import path from 'path'
import { UserRequest } from '~/models/schemas/user.schema'
import fs from 'fs'
import { error } from 'console'
import { ErrorWithStatus } from '~/models/errors.model'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'

const uploadsFolderPath = path.resolve('uploads/images')

const uploadImage = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: uploadsFolderPath,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3000 * 1024, //300kb,
    filter: ({ name, mimetype, ...part }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        //@ts-ignore
        form.emit('error', new formidableErrors.default('file is Not an Image', 0, 400))
      }

      return valid
    }
  })

  return new Promise((resolve, reject) => {
    return form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.images) {
        reject(new ErrorWithStatus({ message: 'File Empty', status: HttpStatusCode.BadRequest }))
      }
      resolve(files)
    })
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
  uploadFile: uploadImage
}
