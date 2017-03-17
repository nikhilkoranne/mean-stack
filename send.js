module.exports.send_to_queue = function (userDetails) {
  var amqp = require('amqplib/callback_api');

  amqp.connect('amqp://vsghbbpi:HnHEcmChgihdO1nomz5EweiMkmdFIRUX@clam.rmq.cloudamqp.com/vsghbbpi', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var q = 'send_mail';
      var msgObj = {};
      var msg = 'Hey there, \n' + 'You are signed up as ' + (userDetails.name || '') + '!' +
        '\n\nHere are your login details: ' +
        '\nUsername: ' + userDetails.email +
        '\nPassword: ' + userDetails.password;
      msgObj.msg = msg;
      msgObj.email = userDetails.email;

      ch.assertQueue(q, { durable: true });
      ch.sendToQueue(q, new Buffer(JSON.stringify(msgObj) + ''));
      console.log(" [x] Sent %s", JSON.stringify(msgObj.msg + ''));
      console.log(" [x] Sent %s", JSON.stringify(msgObj.email + ''));
    });
    setTimeout(function () { conn.close(); }, 3500);
  });
}