import request from "request";
import OpenAI from "openai";
const dotenv = require("dotenv");

dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

import { searchSimilarText } from "../services/faissService";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API key từ biến môi trường
});


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
            temperature: 0.5,
            max_tokens: 200
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI API:", error);
        return "Xin lỗi, tôi không thể trả lời ngay bây giờ.";
    }
};
let sendResponseWelcomeNewCustomer = (username, sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response_first = { "text": `Welcome ${username} to HaryPhamDev's Restaurant` };
            let response_second = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "",
                                "subtitle": "",
                                "image_url": "",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "",
                                        "payload": "",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "",
                                        "payload": "",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "",
                                        "payload": "",
                                    }
                                ],
                            }]
                    }
                }
            };

            //send a welcome message
            await sendTypingOn(sender_psid);
            await sendMessage(sender_psid, response_first);

            //send a image with button view main menu
            await sendTypingOn(sender_psid);
            await sendMessage(sender_psid, response_second);

            resolve("done!")
        } catch (e) {
            reject(e);
        }

    });
};

let sendMessageDefaultForTheBot = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": ""
            };
            //send a media template
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "",
                        "elements": [
                            {
                                "media_type": "video",
                                "url": "",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "",
                                        "title": "Watch more!"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Start over",
                                        "payload": ""
                                    }
                                ]
                            }
                        ]
                    }
                }
            };
            await sendTypingOn(sender_psid);
            await sendMessage(sender_psid, response1);
            await sendTypingOn(sender_psid);
            await sendMessage(sender_psid, response2);
            resolve("done");
        } catch (e) {
            reject(e);
        }
    });
};


let sendMessage = (sender_psid, response) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response,
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v2.6/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                console.log(res)
                console.log(body)
                if (!err) {
                    console.log("message sent!");
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};


let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v2.6/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v2.6/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};



module.exports = {
    generate_response,
    sendResponseWelcomeNewCustomer,
    sendMessageDefaultForTheBot,
    markMessageSeen,
    sendTypingOn,
    sendMessage
};