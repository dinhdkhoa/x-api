export const MediaType = {
  Video: 'Video',
  Image: 'Image'
} as const

export type Media = {
  type: keyof typeof MediaType
  url: string
}
