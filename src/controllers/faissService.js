const faiss = require("faiss-node");
const { OpenAI } = require("openai");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

// Khởi tạo OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Hàm tạo embedding cho văn bản
async function getEmbedding(text) {
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

// Định nghĩa đường dẫn
const faissIndexPath = "../services/faiss_index.idx";
const textChunksPath = "../services/text_chunks.json"; // Đổi từ .pkl sang .json nếu JSON

// Đọc dữ liệu văn bản nếu có
let textChunks = [];
if (fs.existsSync(textChunksPath)) {
    try {
        const buffer = fs.readFileSync(textChunksPath, "utf8");
        textChunks = JSON.parse(buffer);
    } catch (error) {
        console.error("Lỗi khi đọc text_chunks:", error);
    }
}

// Hàm tải FAISS Index
async function loadFaissIndex() {
    if (fs.existsSync(faissIndexPath)) {
        try {
            return await faiss.read_index(faissIndexPath);
        } catch (error) {
            console.error("Lỗi khi tải FAISS index:", error);
            return null;
        }
    }
    console.warn("FAISS Index không tồn tại!");
    return null;
}

// Khởi tạo FAISS Index
let index = null;
(async () => {
    index = await loadFaissIndex();
})();

// Hàm tìm kiếm văn bản tương tự với FAISS
async function searchSimilarText(query, top_k = 3) {
    if (!index) {
        console.error("FAISS Index chưa được tải.");
        return ["Không thể tải FAISS Index."];
    }

    const queryEmbedding = await getEmbedding(query);

    if (!queryEmbedding) {
        return ["Không thể lấy embedding của câu hỏi."];
    }

    const distances = new Float32Array(top_k);
    const indices = new Int32Array(top_k);

    // Tìm kiếm trong FAISS
    index.search(queryEmbedding, top_k, distances, indices);

    // Chuyển indices từ Int32Array thành mảng bình thường
    const indicesArray = Array.from(indices);

    const results = indicesArray.map(i => textChunks[i] || "Không tìm thấy kết quả.");
    return results;
}

// Xuất module theo kiểu CommonJS
module.exports = { searchSimilarText };
