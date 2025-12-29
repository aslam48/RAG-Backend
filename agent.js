import { ChatAnthropic } from "@langchain/anthropic";
import { createAgent } from "langchain";
import {tool} from '@langchain/core/tools'
import { z } from 'zod';
import { MemorySaver } from "@langchain/langgraph";
import { vectorStore, addYTVideoToVectorStore } from "./embeddings.js";
import { triggerYoutubeVideoScrape } from "./brightdata.js";



const triggerYoutubeVideoScrapeTool = tool(
  async ({ url }) => {
    console.log('Triggering youtube video scrape', url);

    const snapshotId = await triggerYoutubeVideoScrape(url);

    console.log('Youtube video scrape triggered', snapshotId);
    return snapshotId;
  },
  {
    name: 'triggerYoutubeVideoScrape',
    description: `
    Trigger the scraping of a youtube video using the url. 
    The tool start a scraping job, that usually takes around 7 seconds
    The tool will return a snapshot/job id, that can be used to check the status of the scraping job
    Before calling this tool, make sure that it is not already in the vector store
  `,
    schema: z.object({
      url: z.string(),
    }),
  }
);

const retrieveTool = tool(async({query, video_id}, {configurable: {}}) => { 
  const retriveDocs = await vectorStore.similaritySearch(query, 1, {video_id}); 
  // const retriveDocs = await vectorStore.similaritySearch(query, 1, (doc) => doc.metadata.video_id === video_id); 
  const serializeDoc = retriveDocs.map((doc) => doc.pageContent).join('\n');
  return serializeDoc 
},{ 
  name: 'retrieve', 
  description: 'retrieve the most relevant chunks of text from the transcript of the youtube video', 
  schema: z.object({ 
    query: z.string(),
    video_id: z.string().describe('the id of the youtube video'),
  }) 
})




const model = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
});


const checkpointer = new MemorySaver();
export const agent = createAgent({
  model, 
  tools: [retrieveTool, triggerYoutubeVideoScrapeTool],
  checkpointer
});

