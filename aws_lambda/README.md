# X,Y Project AWS Lambda Serverless Functions

Install Serverless Framework
https://www.serverless.com/framework

```bash
# Configure AWS keys in local dev environment and make sure it has access to your AWS env to create Lambda Functions etc.

serverless config credentials --provider aws --key <KEY> --secret <SECRET>

# Deploy to AWS

severless deploy
```

Make sure the execution role for this lambda function has access to the S3 bucket you want to upload to.
