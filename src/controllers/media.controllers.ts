import { Request, Response } from 'express'
import path from 'path'
import { STATIC_FILE_ROUTE, UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaService } from '~/services/media.services'

export const uploadImage = async (req: Request, res: Response) => {
  const data = await MediaService.uploadImage(req, res)
  const { newName } = await MediaService.resizeImage(data)
  res.json({ message: 'Image Upload Success', image: `http://localhost:4000${STATIC_FILE_ROUTE}/${newName}` })
}

export const getImage = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) res.status((err as any).status).send('Not Found')
  })
}
