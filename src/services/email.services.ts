import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import { awsIAMConfig } from '~/config'
import { EMAIL_TEMPLATE_DIR } from '~/constants/dir'

// Create SES service object.
const sesClient = new SESClient([awsIAMConfig])
interface CreateSendEmailCommandParams {
  fromAddress: string,
  toAddresses: string | string[],
  ccAddresses?: string[],
  body: any,
  subject: string,
  replyToAddresses?: string[]
}

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: CreateSendEmailCommandParams) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}


export const sendEmailSES = async ({body, subject, toAddresses}: Pick<CreateSendEmailCommandParams, 'toAddresses' |'body' | 'subject' >) => {
  const fromAddress =  process.env.SES_FROM_ADDRESS as string
  const sendEmailCommand = createSendEmailCommand({
    fromAddress,
    toAddresses, 
    body,
    subject
  })

  try {
    return await sesClient.send(sendEmailCommand)
  } catch (e) {
    console.error('Failed to send email.')
    return e
  }
}

const getEmailTemplate = (template = '/email-template.html') => {
  return fs.readFileSync(EMAIL_TEMPLATE_DIR + template, 'utf-8')
}

interface EmailTemplateParams {title: string, content: string, link: string, titleLink: string}

const editTemplateContent = ({content, link,title,titleLink} : EmailTemplateParams) => {
  return getEmailTemplate()
  .replace("{{link}}", link)
  .replace("{{titleLink}}", titleLink)
  .replace("{{title}}", title)
  .replace("{{content}}", content)
}

export const sendEmailWithTemplate = ({toAddresses, subject, ...params}: EmailTemplateParams & Pick<CreateSendEmailCommandParams, 'toAddresses' | 'subject'>) => {
  sendEmailSES({body: editTemplateContent(params), subject, toAddresses})
}