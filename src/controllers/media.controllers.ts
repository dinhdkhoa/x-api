import { Request, Response } from 'express'
import { MediaService } from '~/services/media.services'

export const uploadImage = async (req: Request, res: Response) => {
  const data = await MediaService.uploadImage(req, res)
  const { newName } = await MediaService.resizeImage(data)
  res.json({ message: 'Image Upload Success', image: `http://localhost:4000/uploads/${newName}` })
}
