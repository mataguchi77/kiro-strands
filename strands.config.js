// Bedrock AgentCore configuration
export default {
  name: 'bedrock-qa-agent',
  version: '1.0.0',
  description: 'Answers questions using AWS Bedrock Knowledge Base and LLM',
  agentCore: {
    runtime: 'nodejs20.x',
    handler: 'index.handler',
    timeout: 30,
    memorySize: 512
  }
};
