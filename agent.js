import { ChatAnthropic } from "@langchain/anthropic";
import { createAgent } from "langchain";
import data from './data.js'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import {tool} from '@langchain/core/tools'
import { z } from 'zod';
const video1 = data[0];

const docs = [new Document({
  pageContent: video1.transcript,
  metadata: { video_id: video1.video_id }
})];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await splitter.splitDocuments(docs);
// console.log('chunks', chunks);

// emembed chunks 
const embeddings = new OpenAIEmbeddings({
  model:"text-embedding-3-large"
});


const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(chunks);


//retrive the most relevant chunks 
// const retriveDocs = await vectorStore.similaritySearch("what is the Take on Formula 1's Latest ", 1);
// console.log('retriveDocs', retriveDocs);



const retrieveTool = tool(async({query}) => { 
  console.log('query', query); 
  const retriveDocs = await vectorStore.similaritySearch(query, 1); 
  const serializeDoc = retriveDocs.map((doc) => doc.pageContent).join('\n');
  return serializeDoc 
},{ 
  name: 'retrieve', 
  description: 'retrieve the most relevant chunks of text from the transcript of the youtube video', 
  schema: z.object({ 
    query: z.string() 
  }) 
})





const model = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
});

const agent = createAgent({
  model, 
  tools: [retrieveTool]
});

const result = await agent.invoke({
  messages:[{role:'user', content: "tell the breif what was talked about in the video with the title 'Take on Formula 1's Latest'"}]
});

console.log(result.messages.at(-1).content);