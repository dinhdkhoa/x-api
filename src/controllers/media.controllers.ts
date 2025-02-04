import { Request, Response } from 'express'
import { MediaService } from '~/services/media.services'

export const uploadImage = async (req: Request, res: Response) => {
  const data = await MediaService.uploadFile(req, res)
  res.json(data)
}
