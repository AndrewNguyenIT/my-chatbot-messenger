// require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();
import request from "request";

//import { generate_response } from "../services";

import homepageService from "../services/homepageService";

let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
};

module.exports = {
    getHomePage: getHomePage
}