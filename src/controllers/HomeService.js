import OpenAI from 'openai';
import request from 'request';
require('dotenv').config();

// Cấu hình OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API key từ biến môi trường
});

// Hàm gọi OpenAI để tạo phản hồi
const generate_response = async (query) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Bạn là một chuyên gia tư vấn tuyển sinh." },
                { role: "user", content: query }
            ],
            temperature: 0.7, // Điều chỉnh độ sáng tạo của chatbot
            max_tokens: 200   // Giới hạn độ dài câu trả lời
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI API:", error);
        return "Xin lỗi, tôi không thể trả lời ngay bây giờ.";
    }
};

export { generate_response };
