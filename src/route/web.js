import express from "express";
import homeControllers from "../controllers/HomeControllers";

let router = express.Router();
let initWebRoutes = (app) => {
    router.get("/", homeControllers.getHomePage)

    router.post('/webhook', homeControllers.postWebhook);
    router.get('/webhook', homeControllers.getWebhook);

    return app.use('/', router);
}

module.exports = initWebRoutes;