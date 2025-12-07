import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const runtimeClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Extract input from AgentCore event structure
  const inputText = event.inputText || event.question || event.input;
  
  if (!inputText) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No question provided' })
    };
  }

  try {
    // Retrieve relevant context from Knowledge Base
    const retrieveCommand = new RetrieveCommand({
      knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
      retrievalQuery: {
        text: inputText
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

Question: ${inputText}

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
    
    const answer = responseBody.content[0].text;
    const sources = retrieveResponse.retrievalResults?.map(result => ({
      location: result.location,
      score: result.score
    }));
    
    // Return in AgentCore format
    return {
      statusCode: 200,
      body: JSON.stringify({
        answer,
        sources,
        metadata: {
          modelId,
          knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
          retrievalCount: sources?.length || 0
        }
      })
    };
  } catch (error) {
    console.error('Error processing question:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Failed to answer question: ${error.message}`
      })
    };
  }
};
