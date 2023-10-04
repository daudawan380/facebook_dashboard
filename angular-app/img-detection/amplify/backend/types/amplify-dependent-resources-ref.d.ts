export type AmplifyDependentResourcesAttributes = {
  "auth": {
    "imgdetection05d84463": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    },
    "userPoolGroups": {
      "rekognitionappGroupRole": "string"
    }
  },
  "storage": {
    "s3ForRekognition": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}