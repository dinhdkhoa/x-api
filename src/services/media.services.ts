import { NextFunction, Request, Response } from 'express'
import formidable, { File, errors as formidableErrors } from 'formidable'
import path from 'path'
import { UserRequest } from '~/models/schemas/user.schema'
import fs from 'fs'
import { error } from 'console'
import { ErrorWithStatus } from '~/models/errors.model'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import sharp from 'sharp'

const uploadsFolderPath = path.resolve('uploads/images')

const uploadImage = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: uploadsFolderPath,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, //300kb,
    filter: ({ name, mimetype, ...part }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        //@ts-ignore
        form.emit('error', new formidableErrors.default('file is Not an Image', 0, HttpStatusCode.UnsupportedMediaType))
      }

      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    return form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.image) {
        reject(new ErrorWithStatus({ message: 'File Empty', status: HttpStatusCode.BadRequest }))
      }
      resolve((files.image as unknown as File[])[0])
    })
  })
}

const resizeImage = async (img: File) => {
  const tempFilePath = img.filepath
  const newName = img.newFilename.split('.')[0] + '.jpeg'
  const resizedFilePath = path.join(uploadsFolderPath, newName)
  sharp.cache(false)
  const resizedImg = await sharp(tempFilePath).jpeg({ quality: 20 }).toFile(resizedFilePath)

  fs.unlinkSync(tempFilePath)

  return { ...resizedImg, newName }
}

const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/images')
const UPLOAD_VIDEO_TEMP_DIR = path.resolve('uploads/videos')

export const MediaService = {
  uploadImage,
  resizeImage
}
