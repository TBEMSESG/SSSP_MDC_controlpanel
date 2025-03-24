//var sendMDC = require('./Middleware/sendMdc.js')
//var sendUDP = sendMDC.sendUDP
//var dgram = require('dgram');
var http = require('http');
var fs = require('fs');
var path = require('path');

// Env settings

var config = {}

// Starting the Message Manager between front and backend
var messageManager = (function () {

    var localMsgPort;
    var remoteMsgPort;
    var listenerId;

    function init () {
        var messagePortName = 'WEB_SERVICE_COMMUNICATION';
        var remoteMessagePortName = "BG_SERVICE_COMMUNICATION";
        var calleeAppId = 'hlHpt0841o.CONNECTKiosk';
        var BGserviceId = "hlHpt0841o.SampleBGService";

        remoteMsgPort = tizen.messageport.requestRemoteMessagePort(
            calleeAppId,
            remoteMessagePortName
        );

        localMsgPort = tizen.messageport.requestLocalMessagePort(messagePortName);
        listenerId = localMsgPort.addMessagePortListener(onMessageReceived);


        sendMessage("WEB Started ...") // sends the hardcoded Target IP to the frontend
        sendCommand("startedWEB");  // sends the confirmatieno thet the service is started
        //runServer();

    };

    //Create webserver for settings
    var server = http.createServer(function(req, res) {
    	  // Serve the index.html file
    	  if (req.url === '/') {
    	    var filePath = path.join(__dirname, '..' , 'settings', 'settings.html');
    	    fs.readFile(filePath, 'utf8', function(err, data) {
    	      if (err) {
    	        res.writeHead(500, { 'Content-Type': 'text/plain' });
    	        res.end('Server Error' + err);
    	        return;
    	      }
    	      res.writeHead(200, { 'Content-Type': 'text/html' });
    	      res.end(data);
    	    });
    	  }
    	// Serve the css file (adjust path accordingly if needed)
    	  else if (req.url === '/style.css') {
    	    var filePath = path.join(__dirname, '..', 'settings', 'style.css');
    	    fs.readFile(filePath, 'utf8', function(err, data) {
    	      if (err) {
    	        res.writeHead(500, { 'Content-Type': 'text/plain' });
    	        res.end('Server Error');
    	        return;
    	      }
    	      res.writeHead(200, { 'Content-Type': 'text/css' });
    	      res.end(data);
    	    });
    	  }
    	  // Serve the script.js file (adjust path accordingly if needed)
    	  else if (req.url === '/settings.js') {
    	    var filePath = path.join(__dirname, '..',  'settings','settings.js');
    	    fs.readFile(filePath, 'utf8', function(err, data) {
    	      if (err) {
    	        res.writeHead(500, { 'Content-Type': 'text/plain' });
    	        res.end('Server Error');
    	        return;
    	      }
    	      res.writeHead(200, { 'Content-Type': 'application/javascript' });
    	      res.end(data);
    	    });
    	  }
    	  else if (req.url === '/modifications.js') {
    	    var filePath = path.join(__dirname, '..',  'settings','modifications.js');
    	    fs.readFile(filePath, 'utf8', function(err, data) {
    	      if (err) {
    	        res.writeHead(500, { 'Content-Type': 'text/plain' });
    	        res.end('Server Error');
    	        return;
    	      }
    	      res.writeHead(200, { 'Content-Type': 'application/javascript' });
    	      res.end(data);
    	    });
    	  }
        else if (req.url === '/config' && req.method === 'GET') {

    	      res.writeHead(200, { 'Content-Type': 'application/json' });
    	      res.end(JSON.stringify(config));

    	  }

        else if (req.url === '/saveConfig' && req.method === 'POST') {
          var body = '';

          req.on('data', chunk => {
              body += chunk;
          });

          req.on('end', () => {

              try {
                  const newConfig = JSON.parse(body);
                  config = newConfig;
                  // sendMessage(`WEB - received new config from SettingsPage: ${JSON.stringify(config)} `);
                  sendMessage(`WEB - sending update config to Frontend... `);

                  sendMessage( JSON.stringify(config) , "update" );


                  // Respond with success
                  res.writeHead(200, { 'Content-Type': 'text/plain' });
                  res.end('Config updated successfully');

              } catch (e) {
                  res.writeHead(400, { 'Content-Type': 'text/plain' });
                  res.end('Invalid JSON');
              }
          });

      }


    	  else {
    	    res.writeHead(404, { 'Content-Type': 'text/plain' });
    	    res.end('404 Not Found');
    	  }
    	});

    	// Start the server
   server.listen(3000, function() {
   	  sendMessage(`🌐 WEB - Server is running on http://<DEVICE IP>:3000`);
   	});




    function sendCommand (msg) {
        // send command to Foreground app, like started and terminated
        var messageData = {
            key: 'Command',
            value: msg
        }
        remoteMsgPort.sendMessage([messageData]);
    };

    function sendMessage (msg, key) {
        // sends logs to foreground application
        var messageData = {
            key: key || 'broadcast',
            value: msg
        }
        remoteMsgPort.sendMessage([messageData]);
    };


    function close () {
        localMsgPort.removeMessagePortListener(listenerId);
    };

    function onMessageReceived(data) {
        // sendMessage('WEB service receive data: ' + JSON.stringify(data));


        if (data[0].key === "targetIP") {
        	console.log("App received targetIP from Backend: " + data[0].value )
            targetIP = data[0].value
            ipTarget.innerText = targetIP
            remoteMsgPort.sendMessage("WEB received targetIP..." )
          }

        if (data[0].key === "settings") {
            sendMessage("WEB settings Key received, updating config object...");

            //my way
            var value = JSON.parse(data[0].value)
            config = value



         //   sendMessage("WEB settings Key received, updating config object... number of buttons: " + config.buttonsQty);

          }
    };

    return {
        init: init,
        sendMessage: sendMessage,
        sendCommand: sendCommand
    }
})();



module.exports.onStart = function () {
    messageManager.init();

};

module.exports.onRequest = function () {
    messageManager.sendMessage("module.exports.onRequest callback");
    var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();

    if (reqAppControl && reqAppControl.appControl.operation == "http://tizen.org/appcontrol/operation/pick") {
        var data = reqAppControl.appControl.data;
        if (data[0].value[0] == 'ForegroundApp') {
            messageManager.sendMessage("module.exports.onRequest callback. " + data[0].value[0] + ".");
            //currentVideoId = data[0].value[1];
        }
    }
};

module.exports.onExit = function () {
    messageManager.sendMessage("WEB Service is exiting... ")
    messageManager.sendCommand("WEB terminated")
};