import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";


// emembed chunks 
const embeddings = new OpenAIEmbeddings({
  model:"text-embedding-3-large"
});


export const vectorStore = new MemoryVectorStore(embeddings);

export const addYTVideosToVectorStore = async (videoData) => {
    const { transcript, video_id } = videoData;
const docs = [new Document({
  pageContent: transcript,
  metadata: { video_id }
})];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await splitter.splitDocuments(docs);
await vectorStore.addDocuments(chunks);
}