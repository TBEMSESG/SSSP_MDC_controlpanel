//var sendMDC = require('./Middleware/sendMdc.js')
//var sendUDP = sendMDC.sendUDP
var dgram = require('dgram');
var http = require('http');
var fs = require('fs');
var path = require('path');

// Env settings

var hosts = "10.10.99.150"  //to be changed from Frontend settings?
var portUDP = 5000;


// Starting the Message Manager between front and backend
var messageManager = (function () {
 
    var localMsgPort;
    var remoteMsgPort;
    var listenerId;
    
    function init () {
        var messagePortName = 'BG_SERVICE_COMMUNICATION';
        var calleeAppId = 'hlHpt0841o.CONNECTKiosk';

        remoteMsgPort = tizen.messageport.requestRemoteMessagePort(
            calleeAppId,
            messagePortName
        );
        
        localMsgPort = tizen.messageport.requestLocalMessagePort(messagePortName);
        listenerId = localMsgPort.addMessagePortListener(onMessageReceived);
        
        
        sendMessage( hosts, "targetIP") // sends the hardcoded Target IP to the frontend
        sendCommand("started");  // sends the confirmatieno thet the service is started
        //runServer();
      
    };

  //   //Create webserver for settings
  //   var server = http.createServer(function(req, res) {
  //   	  // Serve the index.html file
  //   	  if (req.url === '/') {
  //   	    var filePath = path.join(__dirname, '..' , 'settings', 'settings.html');
  //   	    fs.readFile(filePath, 'utf8', function(err, data) {
  //   	      if (err) {
  //   	        res.writeHead(500, { 'Content-Type': 'text/plain' });
  //   	        res.end('Server Error' + err);
  //   	        return;
  //   	      }
  //   	      res.writeHead(200, { 'Content-Type': 'text/html' });
  //   	      res.end(data);
  //   	    });
  //   	  }
  //   	// Serve the css file (adjust path accordingly if needed)
  //   	  else if (req.url === '/style.css') {
  //   	    var filePath = path.join(__dirname, '..', 'style.css');
  //   	    fs.readFile(filePath, 'utf8', function(err, data) {
  //   	      if (err) {
  //   	        res.writeHead(500, { 'Content-Type': 'text/plain' });
  //   	        res.end('Server Error');
  //   	        return;
  //   	      }
  //   	      res.writeHead(200, { 'Content-Type': 'application/javascript' });
  //   	      res.end(data);
  //   	    });
  //   	  }
  //   	  // Serve the script.js file (adjust path accordingly if needed)
  //   	  else if (req.url === '/settings.js') {
  //   	    var filePath = path.join(__dirname, '..', 'settings.js');
  //   	    fs.readFile(filePath, 'utf8', function(err, data) {
  //   	      if (err) {
  //   	        res.writeHead(500, { 'Content-Type': 'text/plain' });
  //   	        res.end('Server Error');
  //   	        return;
  //   	      }
  //   	      res.writeHead(200, { 'Content-Type': 'application/css' });
  //   	      res.end(data);
  //   	    });
  //   	  }
  //     	  // Serve the listeners.js file (adjust path accordingly if needed)
  //   	  else if (req.url === '/listeners.js') {
  //   	    var filePath = path.join(__dirname, '..', 'listeners.js');
  //   	    fs.readFile(filePath, 'utf8', function(err, data) {
  //   	      if (err) {
  //   	        res.writeHead(500, { 'Content-Type': 'text/plain' });
  //   	        res.end('Server Error');
  //   	        return;
  //   	      }
  //   	      res.writeHead(200, { 'Content-Type': 'application/javascript' });
  //   	      res.end(data);
  //   	    });
  //   	  }
  //   	  // Handle 404 - File Not Found
  //   	  else {
  //   	    res.writeHead(404, { 'Content-Type': 'text/plain' });
  //   	    res.end('404 Not Found');
  //   	  }
  //   	});

  //   	// Start the server
  //  server.listen(3000, function() {
  //  	  sendMessage(`Server is running on http://<DEVICE IP>:3000`);
  //  	});
    
  
    
    
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
        sendMessage('BG service receive data: ' + JSON.stringify(data));
        
        
        
        if (data[0].key === "myUDP") {
            sendMessage("myUDP Key received, going to sendUDP with comamand: " + data[0].value);

            try {
                // Assuming `hosts` and `portUDP` are defined and valid
                sendUDP(hosts, portUDP, data[0].value);
                sendMessage(`UDP message sent successfully to ${hosts}`);
            } catch (error) {
                sendMessage("Failed to send UDP message: " + error.message);
                console.error("UDP sending error: ", error);
            }
        }
        
        if (data[0].key === "settings") {
            sendMessage("settings Key received, going to overwrite current targetip with: " + data[0].value);
            hosts = data[0].value
           
        }
        	
        
    };
    
    function sendUDP(host, port, command) {
        sendMessage("Invoked sendUDP with: host=" + host + ", port=" + port + ", command=" + command);

        // Create a buffer from the command using the older Buffer constructor
        var message = new Buffer(command);

        sendMessage("Prepared message buffer: " + message + " with length: " + message.length);

        // Create UDP socket
        var socket = dgram.createSocket('udp4');
        
        sendMessage("Socket created...");

        // Send the UDP message
        socket.send(message, 0, message.length, port, host, function (err) {
            if (err) {
                sendMessage("Error sending UDP message: " + err.message);
            } else {
                sendMessage("UDP message sent successfully to " + host + ":" + port);
            }
            socket.close();
        });
    }

    return {
        init: init,
        sendMessage: sendMessage,
        sendCommand: sendCommand
    }
})();





//Following functions are required for background service module
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
    messageManager.sendMessage("Service is exiting... ")
    messageManager.sendCommand("terminated")
};