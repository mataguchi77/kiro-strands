# Bedrock AgentCore QA Agent

An AWS Lambda function for Amazon Bedrock AgentCore that answers questions using Bedrock Knowledge Base and LLM.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. AWS SAM CLI installed: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
3. Node.js 20.x or later
4. A Bedrock Knowledge Base created in your AWS account

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update `samconfig.toml` with your Knowledge Base ID:
```toml
parameter_overrides = "KnowledgeBaseId=\"YOUR_KNOWLEDGE_BASE_ID\""
```

## Local Testing

Test the function locally with SAM:
```bash
npm run local
```

Edit `test-event.json` to test with different questions.

## Deployment

Deploy to AWS using SAM:
```bash
npm run build
npm run deploy
```

On first deployment, SAM will guide you through configuration options.

## Usage with Bedrock AgentCore

Once deployed, the Lambda function can be:
1. Invoked directly via AWS Lambda
2. Integrated as an action in a Bedrock Agent
3. Called from other AWS services

### Input Format

```json
{
  "inputText": "Your question here",
  "sessionId": "optional-session-id",
  "agentId": "optional-agent-id"
}
```

### Output Format

```json
{
  "statusCode": 200,
  "body": {
    "answer": "The answer from the LLM",
    "sources": [
      {
        "location": { "type": "S3", "s3Location": {...} },
        "score": 0.95
      }
    ],
    "metadata": {
      "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
      "knowledgeBaseId": "YOUR_KB_ID",
      "retrievalCount": 3
    }
  }
}
```

## Architecture

- **Runtime**: Node.js 20.x on AWS Lambda
- **Timeout**: 30 seconds
- **Memory**: 512 MB
- **Permissions**: Bedrock InvokeModel and Retrieve

## Configuration

Edit `template.yaml` to modify:
- Function timeout and memory
- IAM permissions
- Environment variables
- Model ID defaults
