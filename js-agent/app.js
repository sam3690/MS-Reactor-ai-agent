import "dotenv/config"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
// import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { ChatPromptTemplate} from "@langchain/core/prompts"

import { YoutubeTranscript } from 'youtube-transcript';
import { Document } from "langchain/document";

import {AzureChatOpenAI, AzureChatOpenAIEmbeddings} from "@langchain/openai"
import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";
// import { ChatOllama} from "@langchain/ollama"
// import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";


const YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch?v=Dk36u4NGeSU"
const QUESTION = "What are the news about GPT-4 models?"

// Load documents -----------------------------------------------------------

console.log("Loading Documents");

const transcript = await YoutubeTranscript.fetchTranscript(YOUTUBE_VIDEO_URL);
const fullTranscript = transcript.map(part => part.text).join(' ');

const rawDocuments = [
  new Document({
    pageContent: fullTranscript,
    metadata: { source: YOUTUBE_VIDEO_URL },
  })
];

const splitter = new RecursiveCharacterTextSplitter({
  chunk: 1000,
  chunkOverlap: 200
});
const documents = await splitter.splitDocuments(rawDocuments);

// Init models and DB -----------------------------------------------------------

console.log("Initializating models and DB");

const embeddings = new AzureChatOpenAIEmbeddings()
const model = new AzureChatOpenAI()
const vectorStore = new AzureAISearchVectorStore(embeddings, {})

// search if documents already exist for the source video
const videoId = YOUTUBE_VIDEO_URL.split("v=")[1]
const indexedDocuments  = await vectorStore.similaritySearch("*",1,{
    filterExpression: `metadata/source eq '${videoId}'`,
})

if (indexedDocuments.length === 0) {
   console.log("Embedding documents...");
   await vectorStore.addDocuments(documents)
   
}




// Run the chain -----------------------------------------------------------
console.log("Running the Chain...");

const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
    ["system", "Answer the user's question using only the sources below:\n\n{context}"],
    ["human", "{input}"],
]);


const retriever = vectorStore.asRetriever();
const ragChain = createStuffDocumentsChain({
    prompt: questionAnsweringPrompt,
    llm: model,
})
const stream = await ragChain.stream({
    input: QUESTION,
    context: await retriever.getRelevantDocuments(QUESTION),
})

// print the result -----------------------------------------------------------
console.log(`Answer for the question "${QUESTION}":\n`);
for await (const chunk of stream) {
    process.stdout.write(chunk ?? "");
}
console.log();


