module.exports.send = function (messageContent, mailTo) {
    var nodemailer = require('nodemailer');

    messageContent = messageContent || 'Signed up successfully!';
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '', // Your email id
            pass: '' // Your password
        }
    });

    var mailOptions = {
        from: '', // sender address
        to: mailTo, // list of receivers
        subject: 'Signed up successfully!!', // Subject line
        text: messageContent //, // plaintext body
        //html: messageContent // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.json({ yo: 'error' });
        } else {
            console.log('Message sent: ' + info.response);
            res.json({ yo: info.response });
        };
    });
}