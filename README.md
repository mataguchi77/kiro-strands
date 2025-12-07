# Bedrock QA Strands Project

A Strands agent that answers questions using AWS Bedrock Knowledge Base and LLM.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials and Bedrock configuration.

## Usage

Run the development server:
```bash
npm run dev
```

Call the agent with a question:
```javascript
{
  "question": "What is your question here?"
}
```

## Response Format

```javascript
{
  "answer": "The answer from the LLM",
  "sources": [
    {
      "location": { /* source location */ },
      "score": 0.95
    }
  ]
}
```
