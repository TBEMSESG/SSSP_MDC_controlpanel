var serviceId = "hlHpt0841o.SampleBGService";
var webServiceId = "hlHpt0841o.WebService";

var serviceLaunched = false;
var webServiceLaunched = false;
var test;
var temp;

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
    // Launch web SErvice for Settings
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
  

// Printer Related functions:
var Printer = {
		  isPortOpen: false,
		  getSerialPrintVersion: function () {
		    var Version = null;
		    try {
		      Version = window.b2bapis.serialprint.getVersion();
		    } catch (e) {
		      console.log(
		        "[SerialPrint API][getVersion] call syncFunction exception [" +
		          e.code +
		          "] name: " +
		          e.name +
		          " message: " +
		          e.message
		      );
		    }
		    if (null !== Version) {
		      console.log(
		        "[SerialPrint API][getVersion] call syncFunction type: " + Version
		      );
		    }
		  },

		  openSerialPrint: function () {
		    console.log("[SerialPrint API][open] function call");
		    if (Printer.isPortOpen == true) {
		      console.log("Serial port is open");
		      return;
		    }
		    var option = null;
		    var result = false;
		    option = {
		      // First Data Terminal
		    //  baudRate: 9600,
		      // Bixolon Printer
		      baudRate: 115200,
		      parity: "NONE",
		      dataBits: "BITS8",
		      stopBits: "1",
		    };

		    console.log(option.baudRate);

		    //	if (BANDRATE_STATUS) option.baudRate = 115200;

		    var printPort = "PRINTERPORT1";

		    function onlistener(printSerialData) {
		      console.log(
		        "[SerialPrint API] Print serial data is " +
		          printSerialData.data +
		          ", Print serial Port is === " +
		          printSerialData.result
		      );
		      if (printSerialData.data == "00") {
		        console.log("Paper status 00 - paper inside printer");
		      } else if (printSerialData.data == "03") {
		        console.log("Paper status 03 - no paper inside printer");
		      }
		    }
		    try {
		      console.log("BaudRate: " + option.baudRate);
		      result = window.b2bapis.serialprint.open(printPort, option, onlistener);
		      if (result == true) {
		        console.log("[SerialPrint API]Success to open print serial port");
		        Printer.isPortOpen = true;
		      } else {
		        console.log("[SerialPrint API]Fail to open print serial port" + result);
		      }
		    } catch (e) {
		      /*if (!BANDRATE_STATUS) {
		        BANDRATE_STATUS = true;
		        openSerialPrint()
		      }*/
		      console.log(
		        "[SerialPrint API][open] call syncFunction exception " +
		          e.code +
		          " " +
		          e.errorName +
		          " " +
		          e.errorMessage
		      );
		    }
		  },

		  closeSerialPrint: function () {
		    console.log("[SerialPrint API][close] function call");
		    var result = false;
		    var printPort = "PRINTERPORT1";

		    try {
		      result = window.b2bapis.serialprint.close(printPort);
		      if (result == false) {
		        console.log("[SerialPrint API]Fail to close print serial port");
		      }
		    } catch (e) {
		      console.log(
		        "[SerialPrint API][close] call syncFunction exception " +
		          e.code +
		          " " +
		          e.errorName +
		          " " +
		          e.errorMessage
		      );
		    }
		  },

		  checkIfPaperInPrinter: function () {
		    console.log("[SerialPrint API][checkIfPaperInPrinter] function call");
		    var result = false;
		    var printPort = "PRINTERPORT1";
		    var command = "1b76";

		    try {
		      result = window.b2bapis.serialprint.writeData(
		        printPort,
		        command,
		        command.length
		      );
		      console.log("[SerialPrint API][writeData_0] writeData size is " + result);
		    } catch (e) {
		      console.log(
		        "[SerialPrint API][writeData] call syncFunction exception " +
		          e.code +
		          " " +
		          e.errorName +
		          " " +
		          e.errorMessage
		      );
		    }
		  },

		  writeReceipt: function (message) {
		    console.log("[SerialPrint API][write] function call");
		    var receiptData, data;
		    var result = false;
		    var printPort = "PRINTERPORT1";
		    if (message == undefined) {
		      receiptData = Printer.generateReceiptData();
		      data = Printer.stringToHexReceipt(receiptData);
		    } else {
		      data = Printer.stringToHexReceipt(message + "\n\n\n\n\n\n\n\n\n\n");
		    }

		    try {
		      // console.log(data);
		      result = window.b2bapis.serialprint.writeData(
		        printPort,
		        data,
		        data.length
		      );
		      console.log("[SerialPrint API][writeData_0] writeData size is " + result);
		    } catch (e) {
		      console.log(
		        "[SerialPrint API][writeData] call syncFunction exception " +
		          e.code +
		          " " +
		          e.errorName +
		          " " +
		          e.errorMessage
		      );
		    }
		  },

		  generateReceiptData: function () {
		    var d = new Date();
		    var receiptData =
		      "test message" +
		      "                                          \n" +
		      "                                          \n" +
		      "                                          \n" +
		      "                                          \n" +
		      "                                          \n";

		    return receiptData;
		  },

		  stringToHexReceipt: function (tmp) {
		    var str = "";
		    var tmp_len = tmp.length;
		    var c;

		    for (var i = 0; i < tmp_len; i += 1) {
		      c = tmp.charCodeAt(i).toString(16);
		      c == "a" ? (c = "0A") : null;
		      str += c.toString(16);

		      i == tmp_len - 1 ? (str += "1B69") : null;
		    }
		    return str;
		  },

		  numberSpaces: function (number) {
		    var total = number.toFixed(2).toString().split(".");
		    if (total[0].length == 1) {
		      total[0] = "   " + total[0];
		    } else if (total[0].length == 2) {
		      total[0] = "  " + total[0];
		    } else if (total[0].length == 3) {
		      total[0] = " " + total[0];
		    }
		    total = total[0] + "." + total[1];
		    return total;
		  },
		};

// Closing Printer rlated part


//Communication with service
var messageManager = (function () {
  var messagePortName = "BG_SERVICE_COMMUNICATION";
  var messagePortNameWEB = "WEB_SERVICE_COMMUNICATION";
    var remoteMsgPort = undefined;
    var remoteMsgPortWeb = undefined;
    var localMsgPort;
    var watchId;
  
    function init() {
        console.log("messageManager.init");
        
        
        localMsgPort = tizen.messageport.requestLocalMessagePort(messagePortName);
        watchId = localMsgPort.addMessagePortListener(onMessageReceived);
  
    }
  
    function connectToRemote() {
        console.log("messageManager.connectToRemote");
        remoteMsgPort = tizen.messageport.requestRemoteMessagePort(
          serviceId,
          messagePortName
        );
        remoteMsgPortWeb = tizen.messageport.requestRemoteMessagePort(
          webServiceId,
          messagePortNameWEB
        );
        //messageManager.runHTTPServer(); // Starting HTTP server
    }

    function sendTest(msg, key) {
        
        var messageData = {
          key: key || "broadcast",
          value: msg || "none",
        };
        
        console.log("messageManager.sendTest called with message: " + JSON.stringify(messageData));
        
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
      console.log("[onMessageReceived] data: " + JSON.stringify(data));
      //test.innerHTML += JSON.stringify(data) + "<br/>";
      if (data[0].value === "started") {
    	console.log("received Started from Backend")
        setTimeout( connectToRemote() ,10) ; //due to performance tuning on Tz7.0 and the CPU priority change, function has to be invoked async
        serviceLaunched = true;
      }
      
      if (data[0].key === "targetIP") {
        	console.log("received targetIP from Backend: " + data[0].value )
            targetIP = data[0].value
            ipTarget.innerText = targetIP
          }
      
      if (data[0].key === "currentIP") {
      	console.log("received currentIP from Backend: " + data[0].value )
          currentIP = data[0].value
        }
      if (data[0].value === "terminated") {
    	console.log("received terminated from backend ... doing nothing atm...")
        localMsgPort.removeMessagePortListener(watchId);
        serviceLaunched = false;
      }
    }
    
    
  
    return {
      init: init,
      terminate: terminate,
      sendTest: sendTest,
      runHTTPServer: runHTTPServer,
    };
  })();

  
  //Initialize function
var init = function () {
      // TODO:: Do your initialization job
      console.log("init() called");
      
      var comms = ["uno","due","tre", "quattro", "cinque", "sei", "sette","otto","nove","dieci","undici","dodici","tredici"];
      
      test = document.querySelector(".test");

      //document.addEventListener("visibilitychange", function () {
      //if (document.hidden) {
        // Something you want to do when hide or exit.
      //} else {
        // Something you want to do when resume.
      //}
    //});
      
      //Printer.openSerialPrint();
      // Printer.checkIfPaperInPrinter();

 
      
      
      
      
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
    var button11 = document.querySelector(".item11");
    var button12 = document.querySelector(".item12");
    var button13 = document.querySelector(".item13");

    var buttons = document.querySelectorAll(".button");

    ipPlaceholder.innerText = currentIP || "unknown"    
    	
    	  // getSubmit from Settings: 
        document.getElementById('myForm').addEventListener('submit', function(event) {
            // Prevent the form from submitting in the traditional way
            event.preventDefault();

            // Get the value from the input field
            var userInput = document.getElementById('userInput').value;
            
            if (userInput !== "") {
          	  messageManager.sendTest(userInput, "settings");
          	  targetIP = userInput
          	  ipTarget.innerText = currentIP
            }
            
        });    	
    	
    // Check for logoclicks to open settings info 
    // by clicking the logo fast 7 times, a small settings page opens to change the target IP address for the UDP commands
    
    // logoButton.addEventListener("click", function () {
    	
    // 	console.log("counting ..." + counter);
    // 	if (counter < 7){
    // 		setTimeout( function () {counter = 0} , 3000 ) 

    // 		counter ++
    // 	}
    // 	if (counter === 7) {
    // 		title.classList.remove("hidden");
    // 		setTimeout(function () {title.classList.add("hidden")}, 20000)
    // 		counter = 0
    // 	}
    	
    // }		 
    // )
    
  	
    		
	
    
    // Eventlisteners to call API
    button1.addEventListener('click' ,  function () {
      
      
      //modal.style.display = "block";
      //modal.classList.add("fold-class");
      messageManager.sendTest(comms[0], "myUDP");
    
    });
    button2.addEventListener('click', function () {
      
      
      //modal.style.display = "block";
      //modal.classList.add("fold-class");
      messageManager.sendTest(comms[1], "myUDP");
    
    });
    button3.addEventListener('click',  function () {
    
  
  //modal.style.display = "block";
  //modal.classList.add("fold-class");
  messageManager.sendTest(comms[2], "myUDP");

});
    button4.addEventListener('click', function () { messageManager.sendTest(comms[3], "myUDP");

    });
    button5.addEventListener('click', function () { messageManager.sendTest(comms[4], "myUDP");

    });
    button6.addEventListener('click', function () { messageManager.sendTest(comms[5], "myUDP");

    });
    button7.addEventListener('click', function () { messageManager.sendTest(comms[6], "myUDP");

    });
    button8.addEventListener('click', function () { messageManager.sendTest(comms[7], "myUDP");

    });
    button9.addEventListener('click', function () { messageManager.sendTest(comms[8], "myUDP");

    });
    button10.addEventListener('click', function () { messageManager.sendTest(comms[9], "myUDP");

    });
    // button11.addEventListener('click', function () { messageManager.sendTest(comms[10], "myUDP");

    // });



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
                test.innerHTML += "OK Button" + "<br/>";
                console.log("INFO OK")
          break;
        case 10009: //RETURN button
          tizen.application.getCurrentApplication().exit();
          break;
        default:
          // console.log("Key code : " + e.keyCode);
          break;
      }
    });
  
    messageManager.init();
    launchService();
    //setTimeout(function() {}, 5000);
  };
  // window.onload can work without <body onload="">
  window.onload = init;
  
  //module.exports = currentIP