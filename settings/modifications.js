var config = require('./settings.js')


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

    // document.getElementById('buttonsQty').addEventListener('change', function(event) {
    //     config.buttonsQty = Number(event.target.value);
    //     renderForm();
    // });

    document.getElementById('configForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        config.buttonsQty = Number(formData.get("buttonsQty"));
        Object.keys(config.buttonsSettings).slice(0, config.buttonsQty).forEach(buttonKey => {
            config.buttonsSettings[buttonKey].name = formData.get(`${buttonKey}-name`);
            config.buttonsSettings[buttonKey].backgroundColor = formData.get(`${buttonKey}-backgroundColor`);
            config.buttonsSettings[buttonKey].connectionType = formData.get(`${buttonKey}-connectionType`);
            config.buttonsSettings[buttonKey].connectionPort = Number(formData.get(`${buttonKey}-connectionPort`));
            config.buttonsSettings[buttonKey].connectionTarget = formData.get(`${buttonKey}-connectionTarget`).split(',');
            config.buttonsSettings[buttonKey].connectionCommand = formData.get(`${buttonKey}-connectionCommand`);
        });
        console.log('Updated Config:', config);
        alert('Configuration updated! Check the console for details.');
    });

    renderForm();
