import { Configuration, OpenAIApi } from "openai";
import request from "request";
require("dotenv").config();

// Cấu hình OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API key từ biến môi trường
});

// Hàm gọi OpenAI để tạo phản hồi
const generate_response = async (query) => {
    let prompt = `
    Bạn là một chatbot tư vấn tuyển sinh. Hãy trả lời câu hỏi sau một cách ngắn gọn và dễ hiểu:

    Người dùng hỏi: ${query}

    Trả lời:
    `;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Bạn là một chuyên gia tư vấn tuyển sinh." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // Điều chỉnh độ sáng tạo của chatbot
            max_tokens: 200 // Giới hạn độ dài câu trả lời
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI API:", error);
        return "Xin lỗi, tôi không thể trả lời ngay bây giờ.";
    }
};

export { generate_response };
