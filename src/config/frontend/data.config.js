require('dotenv').config();

exports.dataConfig = {
    email_sender:process.env.SENDER,
    name_sender: process.env.NAME,
    app_password:process.env.PASSWORD,
    app_deploy_name:process.env.APP_NAME,
    url_app_deploy:process.env.URL_APP
}