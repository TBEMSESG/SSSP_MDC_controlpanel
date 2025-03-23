//var sendMDC = require('./Middleware/sendMdc.js')
//var sendUDP = sendMDC.sendUDP
var dgram = require('dgram');
var http = require('http');
var fs = require('fs');
var path = require('path');

// Env settings

var hosts = "10.10.99.150"  //to be changed from Frontend settings?
var portUDP = 5000;

var configuration = {}

// Starting the Message Manager between front and backend
var messageManager = (function () {
 
    var localMsgPort;
    var remoteMsgPort;
    var remoteMsgPortWeb;
    var listenerId;
    
    function init () {
        var messagePortName = 'BG_SERVICE_COMMUNICATION';
        var calleeAppId = 'hlHpt0841o.CONNECTKiosk';
        var webServiceId = "hlHpt0841o.WebService";


        remoteMsgPort = tizen.messageport.requestRemoteMessagePort(
          calleeAppId,
          messagePortName
      );
       
        
        localMsgPort = tizen.messageport.requestLocalMessagePort(messagePortName);
        listenerId = localMsgPort.addMessagePortListener(onMessageReceived);
        
        
        // sendMessage( hosts, "targetIP") // sends the hardcoded Target IP to the frontend
        sendCommand("started");  // sends the confirmatieno thet the service is started
        sendMessage("BG Started")
        //runServer();
      
    };
    
    
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
        var value = JSON.parse(data[0].value)
        
        sendMessage('BG service received extrapolated value ' + value)
        
        
        if (data[0].key === "myUDP") {
                sendMessage("myUDP Key received, going to sendUDP with comamand: " + value.connectionCommand);
                try {
                    // Assuming `hosts` and `portUDP` are defined and valid
                    // atm, only one 
                    sendUDP(value.connectionTarget[0], value.connectionPort, value.connectionCommand);
                    sendMessage(`UDP message sent successfully to ${value.connectionTarget[0]}`);
                } catch (error) {
                    sendMessage("Failed to send UDP message: " + error.message);
                    console.error("UDP sending error: ", error);
                }
            }
        
        //update config file
        if (data[0].key === "settings") {
            sendMessage(" Background settings Key received, going to overwrite configuration with: " + data[0].value);
            configuration = data[0].value
           
        }        
    };
    
    function sendUDP(host, port, command) {
        sendMessage("BG - Invoked sendUDP with: host=" + host + ", port=" + port + ", command=" + command);

        // Create a buffer from the command using the older Buffer constructor
        var message = new Buffer(command);

        sendMessage("BG - Prepared message buffer: " + message + " with length: " + message.length);

        // Create UDP socket
        var socket = dgram.createSocket('udp4');
        
        sendMessage("BG - Socket created...");

        // to be added : host is array, create a for loop to sen to multi targets

        // Send the UDP message
        socket.send(message, 0, message.length, port, host, function (err) {
            if (err) {
                sendMessage("BG - Error sending UDP message: " + err.message);
            } else {
                sendMessage("BG - UDP message sent successfully to " + host + ":" + port);
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
    messageManager.sendMessage("BG Service is exiting... ")
    messageManager.sendCommand("BG terminated")
};