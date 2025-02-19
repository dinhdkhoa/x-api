import { Request, Response } from 'express'
import path from 'path'
import { STATIC_FILE_ROUTE, UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { Media, MediaType } from '~/models/media.model'
import { MediaService } from '~/services/media.services'
import { uploadFileS3 } from '~/services/s3.services'
import fs from 'fs'

export const uploadImages = async (req: Request, res: Response) => {
  const data = await MediaService.uploadImages(req, res)
  const result: Media[] = await Promise.all(
    data.map(async (file) => {
      const { newName } = await MediaService.resizeImage(file)
      const uploadRes = await uploadFileS3(newName)
      fs.unlinkSync(UPLOAD_IMAGE_DIR + '/' + newName)
      
      return { url: uploadRes.Location || '', type: MediaType.Image }
    })
  )
  res.json({ message: 'Image Upload Success', result })
}

export const uploadVideos = async (req: Request, res: Response) => {
  const data = await MediaService.uploadVideos(req, res)
  const encodedFileName = await MediaService.hlsEncodeVideo({
    inputFile: data[0].newFilename,
    outputFile: 'encoded' + data[0].newFilename,
    ffmpegOptions: ''
  })
  res.json({ ok: 'ok' })
  // const result: Media[] = data.map((file) => {
  //   return { url: `http://localhost:4000${STATIC_FILE_ROUTE}/videos/${file.newFilename}`, type: MediaType.Video }
  // })
  // res.json({ message: 'Video Upload Success', result })
}

export const getStaticFile = (folderPath: string) => (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(folderPath, name), (err) => {
    if (err) res.status((err as any).status).send('Not Found')
  })
}
