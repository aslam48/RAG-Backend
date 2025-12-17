// import { OpenAIEmbeddings } from '@langchain/openai'
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { Document } from "@langchain/core/documents";
// import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

// // emembed chunks 
// const embeddings = new OpenAIEmbeddings({
//   model:"text-embedding-3-large"
// });


// export const vectorStore = await PGVectorStore.initialize(embeddings,{
//   postgresConnectionOptions: {
//     connectionString: process.env.DB_URL,
//   },
//   tableName: 'transcripts',
//   columns: {
//     idColumnName: 'id',
//     embeddingColumnName: 'vector',
//     contentColumnName: 'content',
//     metadataColumnName: 'metadata',
//   },
//   distanceStrategy: 'cosine',
// });

// export const addYTVideosToVectorStore = async (videoData) => {
//     const { transcript, video_id } = videoData;
// const docs = [new Document({
//   pageContent: transcript,
//   metadata: { video_id }
// })];

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 1000,
//   chunkOverlap: 200,
// });

// const chunks = await splitter.splitDocuments(docs);
// await vectorStore.addDocuments(chunks);
// }




import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
});

export const vectorStore = await PGVectorStore.initialize(embeddings, {
  postgresConnectionOptions: {
    connectionString: process.env.DB_URL,
  },
  tableName: 'transcripts',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'vector',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
  distanceStrategy: 'cosine',
});

export const addYTVideoToVectorStore = async (videoData) => {
  const { transcript, video_id } = videoData;

  const docs = [
    new Document({
      pageContent: transcript,
      metadata: { video_id },
    }),
  ];

  // Split the video into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  await vectorStore.addDocuments(chunks);
};