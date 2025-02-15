import faiss from "faiss-node";
import { OpenAI } from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Hàm tạo embedding cho văn bản
export async function getEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error("Lỗi khi tạo embedding:", error);
        return null;
    }
}

// Load FAISS index từ file
const faissIndexPath = "../services/faiss_index.idx";
const textChunksPath = "../services/text_chunks.pkl";

let textChunks = [];
if (fs.existsSync(textChunksPath)) {
    const buffer = fs.readFileSync(textChunksPath);
    textChunks = JSON.parse(buffer.toString());
}

// Hàm tải FAISS Index
async function loadFaissIndex() {
    if (fs.existsSync(faissIndexPath)) {
        return faiss.read_index(faissIndexPath);
    }
    throw new Error("FAISS Index không tồn tại!");
}

const index = await loadFaissIndex();

// Hàm tìm kiếm văn bản tương tự với FAISS
export async function searchSimilarText(query, top_k = 3) {
    const queryEmbedding = await getEmbedding(query);

    if (!queryEmbedding) {
        return ["Không thể lấy embedding của câu hỏi."];
    }

    const distances = new Float32Array(top_k);
    const indices = new Int32Array(top_k);

    // Tìm kiếm trong FAISS
    index.search(queryEmbedding, top_k, distances, indices);

    const results = indices.map(i => textChunks[i]);
    return results;
}
