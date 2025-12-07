import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const runtimeClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export default async function qaAgent({ question }) {
  try {
    // Retrieve relevant context from Knowledge Base
    const retrieveCommand = new RetrieveCommand({
      knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
      retrievalQuery: {
        text: question
      }
    });
    
    const retrieveResponse = await agentClient.send(retrieveCommand);
    
    // Extract context from retrieval results
    const context = retrieveResponse.retrievalResults
      ?.map(result => result.content?.text)
      .filter(Boolean)
      .join('\n\n') || 'No relevant information found.';
    
    // Build prompt with context
    const prompt = `Use the following context to answer the question. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${question}

Answer:`;
    
    // Invoke Bedrock LLM
    const modelId = process.env.MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
    const invokeCommand = new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    const invokeResponse = await runtimeClient.send(invokeCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(invokeResponse.body));
    
    return {
      answer: responseBody.content[0].text,
      sources: retrieveResponse.retrievalResults?.map(result => ({
        location: result.location,
        score: result.score
      }))
    };
  } catch (error) {
    console.error('Error processing question:', error);
    throw new Error(`Failed to answer question: ${error.message}`);
  }
}
