const faiss = require("faiss-node");
const { OpenAI } = require("openai");
const fs = require("fs");
const dotenv = require("dotenv");
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

// Khởi tạo OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Định nghĩa đường dẫn
const directory = "./src/services";  // Đúng với vị trí của index.faiss và docs.json

// Hàm tải FAISS Index
// Hàm load FAISS từ Python
let loadedVectorStore = null;

async function loadFaissStore() {
    try {
        console.log("🔄 Đang tải FAISS từ thư mục:", directory);
        loadedVectorStore = await FaissStore.loadFromPython(directory, new OpenAIEmbeddings({
            model: "text-embedding-3-small"
        }));
        console.log("✅ FAISS Store đã tải thành công!");
    } catch (error) {
        console.error("🚨 Lỗi khi tải FAISS Store:", error);
    }
}


loadFaissStore();

// Hàm tìm kiếm văn bản tương tự với FAISS
async function searchSimilarText(query, top_k = 3) {
    if (!loadedVectorStore) {
        console.error("🚨 FAISS Store chưa được tải.");
        return ["FAISS Store chưa khả dụng."];
    }

    try {
        // Thực hiện tìm kiếm văn bản tương tự
        const results = await loadedVectorStore.similaritySearch(query, top_k);

        // Trích xuất nội dung từ kết quả
        return results.map(item => item.pageContent || "Không tìm thấy nội dung.");
    } catch (error) {
        console.error("Lỗi khi tìm kiếm với FAISS:", error);
        return ["Lỗi khi tìm kiếm FAISS."];
    }
}

// Xuất module theo kiểu CommonJS
module.exports = { searchSimilarText };
