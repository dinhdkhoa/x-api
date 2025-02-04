import { Request, Response } from 'express'
import formidable, { File, errors as formidableErrors } from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { ErrorWithStatus } from '~/models/errors.model'

const uploadImages = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 700 * 1024, //300kb,
    maxTotalFileSize: 700 * 1024 * 4,
    filter: ({ name, mimetype, ...part }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        //@ts-ignore
        form.emit('error', new formidableErrors.default('file is Not an Image', 0, HttpStatusCode.UnsupportedMediaType))
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    return form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.image) {
        reject(new ErrorWithStatus({ message: 'File Empty', status: HttpStatusCode.BadRequest }))
      }
      resolve(files.image as unknown as File[])
    })
  })
}

const resizeImage = async (img: File) => {
  const tempFilePath = img.filepath
  const newName = img.newFilename.split('.')[0] + '.jpeg'
  const resizedFilePath = path.join(UPLOAD_IMAGE_DIR, newName)
  sharp.cache(false)
  const resizedImg = await sharp(tempFilePath).jpeg({ quality: 20 }).toFile(resizedFilePath)

  fs.unlinkSync(tempFilePath)

  return { ...resizedImg, newName }
}

const uploadVideos = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    maxTotalFileSize: 50 * 1024 * 1024 * 1,
    filter: ({ name, mimetype, ...part }) => {
      const valid = Boolean(mimetype?.includes('video') || mimetype?.includes('quicktime'))
      if (!valid) {
        //@ts-ignore
        form.emit('error', new formidableErrors.default('file is Not a Video', 0, HttpStatusCode.UnsupportedMediaType))
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    return form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.video) {
        reject(new ErrorWithStatus({ message: 'File Empty', status: HttpStatusCode.BadRequest }))
      }
      resolve(files.video as unknown as File[])
    })
  })
}

export const MediaService = {
  uploadImages,
  resizeImage,
  uploadVideos
}
