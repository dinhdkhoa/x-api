import { Request, Response } from 'express'
import User from '~/models/user.schema'
import collections from '~/services/collections.services'

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await collections.users.findOne()
    res.json(users)
  } catch (error) {
    res.status(400).json({ error })
  }
}
export async function register(req: Request<{}, {},{email: string, password: string}>, res: Response) {
  try {
    const {email, password} = req.body
    const users = await collections.users.insertOne(new User({email, password}))
    res.json({
      message: 'User registered successfully',
      users
    })
  } catch (error) {
    res.status(400).json({ error })
  }
}
