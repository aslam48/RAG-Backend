import { ChatAnthropic } from "@langchain/anthropic";
import { createAgent } from "langchain";
import data from './data.js'
import {tool} from '@langchain/core/tools'
import { z } from 'zod';
import { MemorySaver } from "@langchain/langgraph";
import { vectorStore, addYTVideosToVectorStore } from "./embeddings.js";



const video1 = data[0];
await addYTVideosToVectorStore(video1);


const retrieveTool = tool(async({query}, {configurable: {video_id}}) => { 
  const retriveDocs = await vectorStore.similaritySearch(query, 1, (doc) => doc.metadata.video_id === video_id); 
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

const checkpointer = new MemorySaver();
const agent = createAgent({
  model, 
  tools: [retrieveTool],
  checkpointer
});

const video_id = "WOX4TuhHN-o";
const result = await agent.invoke({
  messages:[{role:'user', content: "tell the breif what was talked about in the video with the title 'Take on Formula 1's Latest'"}]
},
{configurable: {thread_id:1, video_id}}
);

console.log(result.messages.at(-1).content);