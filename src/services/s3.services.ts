import * as AWS from "@aws-sdk/client-s3";

import { awsIAMConfig } from "~/config";

const client = new AWS.S3([awsIAMConfig]);


(async () => {
  // console.log('data', client)
  try {
    const data = await client.listBuckets({})
    console.log(data)
    // process data.
  } catch (error) {
    // error handling.
    console.log(error)

  }
})();