import * as AWS from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { awsIAMConfig } from "~/config";
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir";
const mime = require('mime-types')

const client = new AWS.S3([awsIAMConfig]);


export const uploadFileS3 = (fileName: string, s3Folder = 'images/', dir: string =UPLOAD_IMAGE_DIR) => {
    const file = fs.readFileSync( dir  + '/' + fileName)
    const contentType =  mime.lookup(fileName) || 'application/octet-stream';
    const parallelUploads3 = new Upload({
      client,
      params: { Bucket : process.env.AWS_BUCKET_NAME, Key: s3Folder + fileName, Body: file, ContentType: contentType},
  
      // optional tags
      tags: [
        /*...*/
      ],
  
      // additional optional fields show default values below:
  
      // (optional) concurrency configuration
      queueSize: 4,
  
      // (optional) size of each part, in bytes, at least 5MB
      partSize: 1024 * 1024 * 5,
  
      // (optional) when true, do not automatically call AbortMultipartUpload when
      // a multipart upload fails to complete. You should then manually handle
      // the leftover parts.
      leavePartsOnError: false,
    });
  
    return parallelUploads3.done()
}


