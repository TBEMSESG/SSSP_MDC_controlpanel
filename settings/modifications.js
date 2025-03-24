var container = document.getElementById('buttonsContainer');
container.innerHTML = ""
var config = {}

fetch('/config')
      .then(response => response.json())
      .then(fetchedConfig => {
          console.log("Config Loaded:", fetchedConfig);
          config = fetchedConfig

          // Example: Update buttons dynamically
      Object.keys(config.buttonsSettings).forEach(buttonKey => {
          
          const button = config.buttonsSettings[buttonKey];
          
          const div = document.createElement('div');
          div.className = 'button-container';
          div.innerHTML = `
              <h2>${buttonKey}</h2>
              <label>Name: <input type="text" name="${buttonKey}-name" value="${button.name}"></label><br>
              <label>Background Color: <input type="color" name="${buttonKey}-backgroundColor" value="${button.backgroundColor}"></label><br>
            <label>Background Image: 
              <input type="file" name="${buttonKey}-backgroundImage" accept="image/*">
              </label>
              <img id="${buttonKey}-preview" src="${button.backgroundImage || ''}" style="max-width: 100px; display: ${button.backgroundImage ? 'block' : 'none'};" /><br>
              <button type="button" id="${buttonKey}-removeImage">Remove Image</button><br> 
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


      var input = div.querySelector(`input[name="${buttonKey}-backgroundImage"]`);
      var preview = div.querySelector(`#${buttonKey}-preview`);

      const removeBtn = div.querySelector(`#${buttonKey}-removeImage`);

      removeBtn.addEventListener('click', function () {
      config.buttonsSettings[buttonKey].backgroundImage = '';
      preview.src = '';
      preview.style.display = 'none';
      input.value = ''; // Clear file input
      });



      input.addEventListener('change', function (e) {
      var file = e.target.files[0];
      
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (event) {
          var base64 = event.target.result;
          preview.src = base64;
          preview.style.display = 'block';

          // Store base64 in config
          config.buttonsSettings[buttonKey].backgroundImage = base64;
      };
      reader.readAsDataURL(file); // Read image as base64
      });



      });

      })
      .catch(error => console.error("Error fetching config:", error));
      
      

  document.getElementById('configForm').addEventListener('submit', function(event) {
          event.preventDefault();
          let formData = new FormData(event.target);
          
          Object.keys(config.buttonsSettings).forEach(buttonKey => {
              config.buttonsSettings[buttonKey].name = formData.get(`${buttonKey}-name`);
              config.buttonsSettings[buttonKey].backgroundColor = formData.get(`${buttonKey}-backgroundColor`);
              config.buttonsSettings[buttonKey].connectionType = formData.get(`${buttonKey}-connectionType`);
              config.buttonsSettings[buttonKey].connectionPort = Number(formData.get(`${buttonKey}-connectionPort`));
              config.buttonsSettings[buttonKey].connectionTarget = formData.get(`${buttonKey}-connectionTarget`).split(',');
              config.buttonsSettings[buttonKey].connectionCommand = formData.get(`${buttonKey}-connectionCommand`);
          });

          fetch('/saveConfig', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(config)
          })
          .then(res => res.text())
          .then(msg => {
              console.log(msg);
              alert('Configuration saved successfully!');
          })
          .catch(err => {
              console.error(err);
              alert('Failed to save configuration.');
          });
      });


 // Trigger the hidden file input when the "Import" button is clicked
 document.getElementById('importConfigBtn').addEventListener('click', function () {
document.getElementById('importConfigInput').click();
});

// Handle file selection and load the config
document.getElementById('importConfigInput').addEventListener('change', function (event) {
var file = event.target.files[0];

if (!file) return;

var reader = new FileReader();
reader.onload = function (e) {
  try {
  var importedConfig = JSON.parse(e.target.result);
  if (!importedConfig.buttonsSettings) {
      alert("Invalid config file.");
      return;
  }
  console.log('Imported config', importedConfig)
  config = importedConfig; // Replace the in-memory config
  fetch('/saveConfig', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(config)
          })
          .then(res => res.text())
          .then(msg => {
              console.log(msg);
              alert("Config imported successfully! Reloading...");
              alert('Configuration saved successfully!');
              location.reload(); // Refresh the page to apply changes
          })
          .catch(err => {
              console.error(err);
              alert('Failed to save configuration.');
          });       
  
} catch (err) {
  alert("Error parsing JSON: " + err.message);
  }
};
reader.readAsText(file);
});       



  document.getElementById('exportConfigBtn').addEventListener('click', function () {
   
   
      if (!config || Object.keys(config).length === 0) {
          alert("Config not loaded yet.");
          return;
      }

      const configBlob = new Blob([JSON.stringify(config, null, 2)], {
          type: 'application/json'
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(configBlob);
      downloadLink.download = 'config-export.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  });