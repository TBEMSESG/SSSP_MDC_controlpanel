const net = require('net');

function sendTcpCommand(targetIP, targetPort, command, callback) {
  const client = new net.Socket();

  client.connect(targetPort, targetIP, () => {
    console.log(`[TCP] Connected to ${targetIP}:${targetPort}`);
    client.write(command);
  });

  client.on('data', (data) => {
    console.log('[TCP] Received:', data.toString());
    client.end(); // Close the connection
    if (callback) callback(null, data);
  });

  client.on('error', (err) => {
    console.error('[TCP] Error:', err.message);
    if (callback) callback(err);
  });

  client.on('close', () => {
    console.log('[TCP] Connection closed');
  });
}

module.exports = sendTcpCommand;
