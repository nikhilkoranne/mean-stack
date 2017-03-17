# mean-stack
## Installation of node packages and integreated services.
- Installation of local node packages
    - `npm install`
- To start the server:
    - Hit the "Start Debugging" button in debug panel of VSCODE.
    - Or just run `npm start`
- To start receiving emails run the consumer service from the project root directory.
    - `node receive.js`
- To use online instance of mongodb, you will have to open free account on https://mlab.com, setup a database,
and use your credentials to connect to the mongodb instance. In server.js you can find the place for adding your database credentials.
- And to utilize the message queue service, you will have to create an account on https://customer.cloudamqp.com/login# , then setup an instance and start it and create a queue there. Then you can use that URL of that queue in send.js and receive.js
- This repo uses https://www.npmjs.com/package/nodemailer to send emails after consuming the queued up messages.
