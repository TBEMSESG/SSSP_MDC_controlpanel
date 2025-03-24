var serviceId = "hlHpt0841o.SampleBGService";
var webServiceId = "hlHpt0841o.WebService";

var serviceLaunched = false;
var serviceLaunchedWeb = false;
var test;
var temp;


var device = {
  ipAddress: "unknown",
  firmwareVersion: "unknown",
  modelCode: "unknown",
  appVersion: "unknown"
}

  // Demo data only test
var configurationZero = {

    "buttonsQty": 8, 
    "buttonsSettings":{
        "Button1":{
            "name":"Button 1",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"udp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"uno"
        },
        "Button2":{
            "name":"Button 2",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"udp",
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"],
            "connectionCommand":"due"
        },
        "Button3":{
            "name":"Button 3",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button4":{
            "name":"Button 4",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button5":{
            "name":"Button 5",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button6":{
            "name":"Button 6",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button7":{
            "name":"Button 7",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button8":{
            "name":"Button 8",
            "backgroundColor":"#0008ff",
            "backgroundImage":"",
            "connectionType":"tcp", 
            "connectionPort":5000,
            "connectionTarget":["10.10.99.150"], 
            "connectionCommand":"AA01XXxxxx"
        },
        "Button9":{
          "name":"Button 9",
          "backgroundColor":"#0008ff",
          "backgroundImage":"",
          "connectionType":"tcp", 
          "connectionPort":5000,
          "connectionTarget":["10.10.99.150"], 
          "connectionCommand":"AA01XXxxxx"
      },
      "Button10":{
        "name":"Button 10",
        "backgroundColor":"#0008ff",
        "backgroundImage":"",
        "connectionType":"tcp", 
        "connectionPort":5000,
        "connectionTarget":["10.10.99.150"], 
        "connectionCommand":"AA01XXxxxx"
    }
    }
}
var configuration = {}

// counter
var counter = 0

var currentIP = webapis.network.getIp() || "unknown"
var targetIP = ""

var ipTarget = document.getElementById("targetIP");
	
	
	
function launchService() {
    // Launch Service Background
    tizen.application.launchAppControl(
      new tizen.ApplicationControl(
        "http://tizen.org/appcontrol/operation/pick",
        null,
        "image/jpeg",
        null,
        [new tizen.ApplicationControlData("caller", ["ForegroundApp", ""])]
      ),
      serviceId,
      function () {
        console.log("launchService " + serviceId + " success");
      },
      function (e) {
        console.log("launchService " + serviceId + " failed: " + e.message);
      }
    );
    // Launch web Service for Settings
    tizen.application.launchAppControl(
      new tizen.ApplicationControl(
        "http://tizen.org/appcontrol/operation/pick",
        null,
        "image/jpeg",
        null,
        [new tizen.ApplicationControlData("caller", ["ForegroundApp", ""])]
      ),
      webServiceId,
      function () {
        console.log("launchService " + webServiceId + " success");
      },
      function (e) {
        console.log("launchService " + webServiceId + " failed: " + e.message);
      }
    );
  }


function isEmpty(value) {
    return value == null || value.length === 0;
  }
  


//Communication with service
var messageManager = (function () {
  // PortName to receive messages
  var messagePortName = "BG_SERVICE_COMMUNICATION";

  var messagePortNameWEB = "WEB_SERVICE_COMMUNICATION";
  var remoteMsgPort = undefined;
  var remoteMsgPortWeb = undefined;
  var localMsgPort;
  var watchId;
  
    function init() {
        console.log("messageManager.init");
        // localMsgPort is create to receive messages from other apps.
        
        localMsgPort = tizen.messageport.requestLocalMessagePort(messagePortName);
        watchId = localMsgPort.addMessagePortListener(onMessageReceived);
  
    }
  
    function connectToRemote() {
        console.log("messageManager.connectToRemote");
        remoteMsgPort = tizen.messageport.requestRemoteMessagePort(
          serviceId,
          messagePortName
        );
        
        // messageManager.runHTTPServer(); // Starting HTTP server
    }

    function connectToRemoteWeb() {
      console.log("messageManager.connectToRemoteWeb");
      remoteMsgPortWeb = tizen.messageport.requestRemoteMessagePort(
        webServiceId,
        messagePortNameWEB
      );
    }

    function sendToWeb(msg, key) {
        
      var messageData = {
        key: key || "broadcast",
        value: msg || "none",
      };
      
      console.log("messageManager.sendToWeb called with message: " + JSON.stringify(messageData));
      
      remoteMsgPortWeb && remoteMsgPortWeb.sendMessage([messageData]);
  
  }

    function sendTest(msg, key) {
        
        var messageData = {
          key: key || "broadcast",
          value: msg || "none",
        };
        
        console.log("Frontend messageManager.sendTest called with message: " + JSON.stringify(messageData));
        
        remoteMsgPort && remoteMsgPort.sendMessage([messageData]);
    
    }
    
    function runHTTPServer(msg) {
      console.log("messageManager.runHTTPServer");
      if (isEmpty(msg)) {
        var messageData = {
          key: "runServer",
          value: "empty",
        };
      } else {
        var messageData = {
          key: "runServer",
          value: msg,
        };
      }
  
      temp = messageData.msg;
      console.log(messageData);
      remoteMsgPort.sendMessage([messageData]);
    }
  
    function terminate() {
      var messageData = {
        key: "terminate",
        value: "now",
      };
      remoteMsgPort.sendMessage([messageData]);
    }
  
    function onMessageReceived(data) {
      console.log("App [onMessageReceived] data: " + JSON.stringify(data));
        
      if (data[0].value === "started") {
          console.log("App received Started from Backend")
            setTimeout( connectToRemote() ,10) ; //due to performance tuning on Tz7.0 and the CPU priority change, function has to be invoked async
            serviceLaunched = true;
          setTimeout(() =>  writeConfigFirstTime(configurationZero), 100) ;
          setTimeout(() =>  readConfig(configuration), 500) ;

      }
      if (data[0].value === "startedWEB") {
        console.log("App received Started from Backend")
          setTimeout( connectToRemoteWeb() ,10) ; //due to performance tuning on Tz7.0 and the CPU priority change, function has to be invoked async
          serviceLaunchedWeb = true;
    }
      if (data[0].key === "targetIP") {
        	console.log("App received targetIP from Backend: " + data[0].value )
            targetIP = data[0].value
            //  ipTarget.innerText = targetIP
            // setTimeout(() => {sendToWeb("targetIP", data[0].value )}, 15000) // Forwards the IP address to the Web Server backend
          }
      
      if (data[0].key === "currentIP") {
      	console.log("App received currentIP from Backend: " + data[0].value )
          currentIP = data[0].value
        }
      if (data[0].value === "terminated") {
    	console.log("App received terminated from backend ... doing nothing atm...")
        localMsgPort.removeMessagePortListener(watchId);
        serviceLaunched = false;
      }

      if (data[0].key === "update") {
        console.log("App received updated Config from Settings backend ")
          
        configuration = JSON.parse(data[0].value)
        
        writeConfig(configuration) // write the new configuration to disk
        console.log("new configurtation: " + JSON.stringify(configuration))
       
        sendTest(JSON.stringify(configuration), "settings")       // send the new configuration to backend server   

        updateButtons() // update the frontend
        console.log("updated?...")
      }

    }

    
  // Save config Data to Local storage: 
  // function to write data

  function writeConfigFirstTime() {
    tizen.filesystem.resolve('documents', function(dir) {
        var fileExists = false;

        try {
            var file = dir.resolve('config.json'); // Try resolving the file
            fileExists = file !== null; // If file is found, mark it as existing
        } catch (e) {
            fileExists = false; // If an exception occurs, assume file doesn't exist
        }

        if (!fileExists) {
            // Create a new file named 'config.json'
            var newFile = dir.createFile('config.json');
            if (newFile) {
                // Open the file in write mode
                newFile.openStream('w', function(fileStream) {
                    // Write the JSON data into the file
                    fileStream.write(JSON.stringify(configurationZero));
                    // Close the file stream
                    fileStream.close();
                    // Log success message
                    console.log('Config file written successfully.');
                }, function(error) {
                    console.error('Error opening file stream: ' + error.message);
                });
            } else {
                console.error('File creation failed.');
            }
        } else {
            console.log("Config file already exists... skipping");
        }
    }, function(error) {
        console.error('Error resolving filesystem: ' + error.message);
    }, 'rw');
}

function writeConfig(data) {
  // Resolve the 'documents' directory
  // fileStream.position = 0
  
  tizen.filesystem.resolve('documents', function(dir) {
      function writeFile() {
          console.log('Creating new file....');
          var newFile = dir.createFile('config.json');
          if (newFile) {
              // Open the file in write mode ('w' overwrites the file)
              newFile.openStream('rw', function(fileStream) {
                  // Write the JSON data into the file
                  fileStream.write(JSON.stringify(data));
                  // Close the file stream
                  fileStream.close();
                  console.log('File written successfully.');
              }, function(error) {
                  console.error('Error opening file stream: ' + error.message);
              });
          } else {
              console.error('File creation failed.');
          }
        }
      function onDelete() {
          console.log('deletedFile() is successfully done.');
          writeFile()
      }
      try {
          // Check if the file exists
          var existingFile = dir.resolve('config.json');
          if (existingFile) {
              console.log('Existing config.json found. Deleting...');
              dir.deleteFile(existingFile.fullPath, onDelete, (err) => {console.log(err)} );
              return;
          }
      } catch (e) {
          console.log('No existing config.json found. Creating a new one.');
      }

      // If file doesn't exist, proceed with creating it
      writeFile();
  }, function(error) {
      console.error('Error resolving filesystem: ' + error.message);
  }, 'rw');
}

function readConfig() {
    // Resolve the 'documents' directory
    tizen.filesystem.resolve('documents', function(dir) {
      // Retrieve the file object
      var file = dir.resolve('config.json');
      if (file) {
          // Open the file in read mode
          file.openStream('r', function(fileStream) {
              // Read the file content
              var content = fileStream.read(fileStream.bytesAvailable);
              // Close the file stream
              fileStream.close();
              // Log the file content
              console.log('File content:', JSON.parse(content));
              configuration = JSON.parse(content)
              sendToWeb(JSON.stringify(configuration), "settings")
              sendTest(JSON.stringify(configuration), "settings")
              setTimeout(() => updateButtons(), 500 );

          }, function(error) {
              console.error('Error opening file stream: ' + error.message);
          });
      } else {
          console.error('File not found.');
      }
  }, function(error) {
      console.error('Error resolving filesystem: ' + error.message);
  }, 'r');
}
    
  
    return {
      init: init,
      terminate: terminate,
      sendTest: sendTest,
      runHTTPServer: runHTTPServer,
    };
  })();

  function updateButtons() {
    console.log("calles updatButton...")

    Object.keys(configuration.buttonsSettings).forEach((buttonKey, index) => {
   
        var button = configuration.buttonsSettings[buttonKey];


        let buttonClass = `.item${index + 1}`;
        let buttonElement = document.querySelector(buttonClass);
        if (buttonElement) {
          if (!button.name || button.name.trim() === "") {
            buttonElement.style.display = "none";
          } else {
            buttonElement.style.display = "block";
            buttonElement.querySelector("p").textContent = button.name;
            buttonElement.style.backgroundColor = button.backgroundColor || "";
            buttonElement.style.backgroundImage = button.backgroundImage
              ? `url(${button.backgroundImage})`
              : "none";
          }
        }
    });
}
  
  //Initialize function
var init = function () {
      // TODO:: Do your initialization job
      console.log("App init() called");
            
      test = document.querySelector(".test");

  
      
    // Listeners
    var title = document.querySelector(".title");
    var ipPlaceholder = document.getElementById("myIP");
    var logoButton = document.querySelector(".logo");
    var button1 = document.querySelector(".item1");
    var button2 = document.querySelector(".item2");
    var button3 = document.querySelector(".item3");
    var button4 = document.querySelector(".item4");
    var button5 = document.querySelector(".item5");
    var button6 = document.querySelector(".item6");
    var button7 = document.querySelector(".item7");
    var button8 = document.querySelector(".item8");
    var button9 = document.querySelector(".item9");
    var button10 = document.querySelector(".item10");
    var deviceInfo = document.querySelector('.deviceInfo')

    var buttons = document.querySelectorAll(".button");
  

    ipPlaceholder.innerText = currentIP || "unknown"    
    	
    	  // // getSubmit from Settings: 
        // document.getElementById('myForm').addEventListener('submit', function(event) {
        //     // Prevent the form from submitting in the traditional way
        //     event.preventDefault();

        //     // Get the value from the input field
        //     var userInput = document.getElementById('userInput').value;
            
        //     if (userInput !== "") {
        //   	  messageManager.sendTest(userInput, "settings");
        //   	  targetIP = userInput
        //   	  ipTarget.innerText = userInput
        //     }
        // });    	
    	

  	
    		
	
    
    // Eventlisteners to call API
    button1.addEventListener('click' ,  function () {
      
      
      //modal.style.display = "block";
      //modal.classList.add("fold-class");
      messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button1), "myUDP");
    
    });


    button2.addEventListener('click', function () {
      
      
      //modal.style.display = "block";
      //modal.classList.add("fold-class");
      messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button2), "myUDP");
    
    });
    button3.addEventListener('click',  function () {
    
  
  //modal.style.display = "block";
  //modal.classList.add("fold-class");
  messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button3), "myUDP");

});
    button4.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button4), "myUDP");


    });
    button5.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button5), "myUDP");


    });
    button6.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button6), "myUDP");


    });
    button7.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button7), "myUDP");


    });
    button8.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button8), "myUDP");


    });
    button9.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button9), "myUDP");


    });
    button10.addEventListener('click', function () {       messageManager.sendTest(JSON.stringify(configuration.buttonsSettings.Button10), "myUDP");


    });
    // button11.addEventListener('click', function () { messageManager.sendTest(comms[10], "myUDP");

    // });

    tizen.tvinputdevice.registerKey('Info')


    // add eventListener for keydown
    document.addEventListener("keydown", function (e) {
      switch (e.keyCode) {
        case 37: //LEFT arrow
          break;
        case 38: //UP arrow
          break;
        case 39: //RIGHT arrow
          break;
        case 40: //DOWN arrow
          break;
        case 13: //OK button
        
 
          	
          break;
        case 457: //INFO Button
              title.classList.toggle("hidden");
              setTimeout(function () {title.classList.add("hidden")}, 20000)
          break;
        case 10009: //RETURN button
          tizen.application.getCurrentApplication().exit();
          break;
        default:
          // console.log("Key code : " + e.keyCode);
          break;
      }
    });
  
    try {
      device.ipAddress = webapis.network.getIp();
      device.firmwareVersion = webapis.productinfo.getFirmware()
      device.modelCode = webapis.productinfo.getRealModel();
      device.appVersion = tizen.application.getCurrentApplication()
      device.packageVersion = tizen.package.getPackageInfo();
      deviceInfo.innerHTML = `<br>DEBUG:<br>App Version: <b>${device.appVersion.appInfo.version}</b><br>Package Version: <b>${device.packageVersion.version}</b> <br>Device Model Code: <b>${device.modelCode}</b> running Firmware Version: <b>${device.firmwareVersion}</b>.<br> Press <b>INFO</b> again to hide this window...`
 
    } catch (e) {
      console.log("getIp exception [" + e.code + "] name: " + e.name + " message: " + e.message);
    }

    messageManager.init();
    launchService();
    //setTimeout(function() {}, 5000);
  };
  // window.onload can work without <body onload="">
  window.onload = init;
  
  //module.exports = currentIP