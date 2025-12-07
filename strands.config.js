export default {
  name: 'bedrock-qa',
  version: '1.0.0',
  agents: {
    qaAgent: {
      handler: './src/agents/qaAgent.js',
      description: 'Answers questions using Bedrock Knowledge Base and LLM'
    }
  }
};
