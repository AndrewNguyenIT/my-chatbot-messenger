import request from "request";
import chatBotService from "../services/chatBotService";

const dotenv = require("dotenv");

dotenv.config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;


let setUpMessengerPlatform = (PAGE_ACCESS_TOKEN) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                "get_started": {
                    "payload": "GET_STARTED"
                },
                "persistent_menu": [
                    {
                        "locale": "default",
                        "composer_input_disabled": false,
                        "call_to_actions": [
                            {
                                "type": "web_url",
                                "title": "View Youtube Channel",
                                "url": "",
                                "webview_height_ratio": "full"
                            },
                            {
                                "type": "web_url",
                                "title": "View Facebook Fan Page",
                                "url": "",
                                "webview_height_ratio": "full"
                            },
                            {
                                "type": "postback",
                                "title": "Restart this conversation",
                                "payload": "RESTART_CONVERSATION"
                            }
                        ]
                    }
                ],

                "whitelisted_domains": [
                    process.env.SERVER_URL]
            };

            request({
                "uri": "https://graph.facebook.com/v6.0/me/messenger_profile",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": data
            }, (err, res, body) => {
                if (!err) {
                    resolve("setup done!");
                } else {
                    reject(err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
};

let sendGuideToUseBot = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response1 = {
                "text": "Xin chào, Tôi là chatbot tư vấn tuyển sinh 😎" +
                    "\nTôi có thể trả lời các câu hỏi về phương thức xét tuyển, ngành học, học phí thời gian đăng kí nhập học và nhiều câu hỏi khác nữa 😊"
            };
            let response2 = {
                text: "Để biết thêm nhiểu thông tin bạn có thể truy cập: 🤠" +
                    "\nWebsite: \n👉 https://tuyensinh.ctu.edu.vn/dai-hoc-chinh-quy/thong-tin-tuyen-sinh.html"
            };

            await chatBotService.sendTypingOn(sender_psid);
            await chatBotService.sendMessage(sender_psid, response1);
            await chatBotService.sendTypingOn(sender_psid);
            await chatBotService.sendMessage(sender_psid, response2);
            await chatBotService.sendTypingOn(sender_psid);
            resolve("done");
        } catch (e) {
            reject(e);
        }
    });
};


module.exports = {
    setUpMessengerPlatform: setUpMessengerPlatform,
    sendGuideToUseBot: sendGuideToUseBot
};