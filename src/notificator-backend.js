const express = require('express');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const {dataConfig} = require('./config/backend/data.config');
const { mailList } = require('./config/backend/mail.list.config')

const app = express();

const server = app.listen(0, () =>{
    console.log(`Email sender listening on port ${server.address().port}`);
    const emailTemplate = fs.readFileSync(__dirname+'/templates/animateEmailTemplate.ejs', 'utf8');

    const renderedTemplate = ejs.render(emailTemplate, {
        subject: `${dataConfig.app_deploy_name} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        title: dataConfig.app_deploy_name,
        body: `Se realizó un nuevo despliegue para la aplicación ${dataConfig.app_deploy_name} con fecha y hora: ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`,
        urlapp: dataConfig.url_app_deploy
   });
   
   const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: dataConfig.email_sender, // Cuenta de correo electrónico desde donde se enviará el correo
            pass: dataConfig.app_password // password de aplicación 
        }
    });

   const mailOptions = {
        from: `${dataConfig.name_sender} <${dataConfig.email_sender}>`,
        to: mailList,
        subject: `[Nueva version de aplicación en Backend] ${dataConfig.app_deploy_name} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        html: renderedTemplate
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
         console.error(error);
        } else {
         console.log("Email sent: " + info.response);
        }
    });
    server.close();
});