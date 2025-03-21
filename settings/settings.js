//var sendMDC = require('./Middleware/sendMdc.js')
//var sendUDP = sendMDC.sendUDP
//var dgram = require('dgram');
var http = require('http');
var fs = require('fs');
var path = require('path');

// Env settings

// var hosts = "10.10.99.150"  //to be changed from Frontend settings?
// var portUDP = 5000;
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
        
        
        sendMessage( "WEB Started ...") // sends the hardcoded Target IP to the frontend
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
           	  // Serve the script.js file (adjust path accordingly if needed)
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
 
    	  else {
    	    res.writeHead(404, { 'Content-Type': 'text/plain' });
    	    res.end('404 Not Found');
    	  }
    	});

    	// Start the server
   server.listen(3000, function() {
   	  sendMessage(`WEB - Server is running on http://<DEVICE IP>:3000`);
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
        sendMessage('WEB service receive data: ' + JSON.stringify(data));
        

        if (data[0].key === "targetIP") {
        	console.log("App received targetIP from Backend: " + data[0].value )
            targetIP = data[0].value
            ipTarget.innerText = targetIP
            remoteMsgPort.sendMessage("WEB received targetIP..." )
          }

        if (data[0].key === "settings") {
            sendMessage("WEB settings Key received, updating config object,,,");
            config=data[0].value
            renderForm
        }
    };
    
    function renderForm() {
      const container = document.getElementById('buttonsContainer');
      container.innerHTML = '';
      
      Object.keys(config.buttonsSettings).slice(0, config.buttonsQty).forEach(buttonKey => {
          const button = config.buttonsSettings[buttonKey];
          
          const div = document.createElement('div');
          div.className = 'button-container';
          div.innerHTML = `
              <h3>${buttonKey}</h3>
              <label>Name: <input type="text" name="${buttonKey}-name" value="${button.name}"></label><br>
              <label>Background Color: <input type="color" name="${buttonKey}-backgroundColor" value="${button.backgroundColor}"></label><br>
              <label>Connection Type: 
                  <select name="${buttonKey}-connectionType">
                      <option value="tcp" ${button.connectionType === "tcp" ? "selected" : ""}>TCP</option>
                      <option value="udp" ${button.connectionType === "udp" ? "selected" : ""}>UDP</option>
                  </select>
              </label><br>
              <label>Connection Port: <input type="number" name="${buttonKey}-connectionPort" value="${button.connectionPort}"></label><br>
              <label>Connection Target: <input type="text" name="${buttonKey}-connectionTarget" value="${button.connectionTarget.join(',')}"></label><br>
              <label>Connection Command: <input type="text" name="${buttonKey}-connectionCommand" value="${button.connectionCommand}"></label><br>
          `;
          container.appendChild(div);
      });
  }


//   document.getElementById('configForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const formData = new FormData(event.target);
//     config.buttonsQty = Number(formData.get("buttonsQty"));
//     Object.keys(config.buttonsSettings).slice(0, config.buttonsQty).forEach(buttonKey => {
//         config.buttonsSettings[buttonKey].name = formData.get(`${buttonKey}-name`);
//         config.buttonsSettings[buttonKey].backgroundColor = formData.get(`${buttonKey}-backgroundColor`);
//         config.buttonsSettings[buttonKey].connectionType = formData.get(`${buttonKey}-connectionType`);
//         config.buttonsSettings[buttonKey].connectionPort = Number(formData.get(`${buttonKey}-connectionPort`));
//         config.buttonsSettings[buttonKey].connectionTarget = formData.get(`${buttonKey}-connectionTarget`).split(',');
//         config.buttonsSettings[buttonKey].connectionCommand = formData.get(`${buttonKey}-connectionCommand`);
//     });
//     console.log('Updated Config:', config);
//     alert('Configuration updated! Check the console for details.');
// });

    // Listeners
    //    var title = document.querySelector(".title");
    //    var ipPlaceholder = document.getElementById("myIP");
    //    var logoButton = document.querySelector(".logo");
    //    var button1 = document.querySelector(".item1");
    //    var button2 = document.querySelector(".item2");
    //    var button3 = document.querySelector(".item3");
    //    var button4 = document.querySelector(".item4");
    //    var button5 = document.querySelector(".item5");
    //    var button6 = document.querySelector(".item6");
    //    var button7 = document.querySelector(".item7");
    //    var button8 = document.querySelector(".item8");
    //    var button9 = document.querySelector(".item9");
    //    var button10 = document.querySelector(".item10");
    //    var button11 = document.querySelector(".item11");
    //    var button12 = document.querySelector(".item12");
    //    var button13 = document.querySelector(".item13");
    // var ipTarget = document.querySelector(".TargetIP");
    //    var buttons = document.querySelectorAll(".button");
    
    // ipPlaceholder.innerText = currentIP || "unknown"    
    
    
    //Following functions are required for background service module
    

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