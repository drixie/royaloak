const { spawn } = require('child_process');

const pythonPromise = (script, symbol, timeframe, clientId) => {
  return new Promise((resolve, reject) => {
    //TO DO: rename this into python, or abstract the call.
    const python = spawn('python3', [script, symbol, timeframe, clientId]);
    python.stdout.on('data', (data) => {
      resolve(data.toString().trim());
    });

    python.stderr.on('data', (data) => {
      reject(data.toString().trim());
    });
  });
};

module.exports = pythonPromise;
