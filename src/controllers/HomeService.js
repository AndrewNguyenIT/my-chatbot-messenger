import OpenAI from 'openai';
import request from 'request';

import { searchSimilarText } from "./faissService.js";

const dotenv = require("dotenv");

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
        Bạn là một chatbot tư vấn tuyển sinh của trường Đại học Cần Thơ. Dưới đây là một số thông tin về tuyển sinh:

        ${context}

        Người dùng hỏi: ${query}

        Trả lời dựa trên thông tin trên một cách ngắn gọn và dễ hiểu, không được tự sinh ra câu trả lời. Nếu không đủ thông tin bạn có thể gửi link này cho người hỏi :https://tuyensinh.ctu.edu.vn/dai-hoc-chinh-quy/thong-tin-tuyen-sinh.html
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

let chatBotService = {
    // Đánh dấu tin nhắn là đã xem
    markMessageSeen: async (sender_psid) => {
        let request_body = {
            "recipient": { "id": sender_psid },
            "sender_action": "mark_seen"
        };

        await request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (err) {
                console.error("Unable to mark message as seen:", err);
            } else {
                console.log("Message marked as seen!");
            }
        });
    },

    // Gửi trạng thái "đang nhập"
    sendTypingOn: async (sender_psid) => {
        let request_body = {
            "recipient": { "id": sender_psid },
            "sender_action": "typing_on"
        };

        await request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (err) {
                console.error("Unable to send typing status:", err);
            } else {
                console.log("Typing status sent!");
            }
        });
    }
};

module.exports = { generate_response, chatBotService };
