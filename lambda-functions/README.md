# Lambda Function To Get Summary from an Article URL

This directory holds the definition of a function to be deployed to AWS Lambda that returns the summary and metadata of an article provided in the body of the request.
This AWS Lambda function gets automatically updated (via the AWS CLI [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-reference.html)) whenever new updates are pushed to 'master' via `.github/workflows/python-lambda-deployment.yml`

### Manually Testing Function w/ curl
The follow curl command sends a POST request to the function.

```
curl -X POST https://slkmjr3jsa.execute-api.us-east-1.amazonaws.com/Prod/summarize \
-H "Content-Type: application/json" \
-d '{ "url": "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html"}'
```

### Manually Deploying an Update
If for some reason you want to update the lambda function manually, you can do that with the following commands:

```
# This command will create a '.sam-config' directory with artifacts for the next deploy command
sam build --use-container --template-file ./lambda-functions/.sam-configs/sam_build_template.yml

sam deploy --config-file ./lambda-functions/.sam-configs/samconfig.toml
```