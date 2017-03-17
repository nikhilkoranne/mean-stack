#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var send_mail = require('./send_mail.js');

amqp.connect('amqp://vsghbbpi:HnHEcmChgihdO1nomz5EweiMkmdFIRUX@clam.rmq.cloudamqp.com/vsghbbpi', function (err, conn) {
  conn.createChannel(function (err, ch) {
    var q = 'send_mail';

    ch.assertQueue(q, { durable: true });
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function (msg) {
      var obj = msg.content.toString();
      console.log(" [x] Received %s", JSON.parse(msg.content.toString() + '').msg);
      var emailTo = JSON.parse(msg.content.toString() + '').email;
      var message = JSON.parse(msg.content.toString() + '').msg;
      send_mail.send(message, emailTo);
    }, { noAck: true });
  });
});