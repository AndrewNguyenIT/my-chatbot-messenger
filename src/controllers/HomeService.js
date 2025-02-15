import OpenAI from 'openai';
import request from 'request';

import { searchSimilarText } from "./faissService.js";

import dotenv from 'dotenv';
dotenv.config();

// Cấu hình OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API key từ biến môi trường
});

// Hàm gọi OpenAI để tạo phản hồi
// const generate_response = async (query) => {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "Bạn là một chuyên gia tư vấn tuyển sinh." },
//                 { role: "user", content: query }
//             ],
//             temperature: 0.7, // Điều chỉnh độ sáng tạo của chatbot
//             max_tokens: 200   // Giới hạn độ dài câu trả lời
//         });

//         return response.choices[0].message.content.trim();
//     } catch (error) {
//         console.error("Lỗi khi gọi OpenAI API:", error);
//         return "Xin lỗi, tôi không thể trả lời ngay bây giờ.";
//     }
// };

const generate_response = async (query) => {
    try {
        // Tìm kiếm các đoạn văn bản tương tự
        const relevantTexts = await searchSimilarText(query);
        const context = relevantTexts.join("\n\n");

        // Tạo prompt
        const prompt = `
        Bạn là một chatbot tư vấn tuyển sinh. Dưới đây là một số thông tin về tuyển sinh:

        ${context}

        Người dùng hỏi: ${query}

        Trả lời dựa trên thông tin trên một cách ngắn gọn và dễ hiểu:
        `;

        // Gọi OpenAI API để tạo câu trả lời
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Bạn là một chuyên gia tư vấn tuyển sinh." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI API:", error);
        return "Xin lỗi, tôi không thể trả lời ngay bây giờ.";
    }
};

module.exports = { generate_response };
