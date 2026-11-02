const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true
});

app.get('/', (req, res) => {
  res.send('Ride-hailing auth server is running...');
});

// Pusher authentication endpoint for private/presence channels
app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  // Optional: Add custom user validation logic here (e.g., checking if username exists)
  const authResponse = pusher.authenticate(socketId, channel);
  res.send(authResponse);
});

// Support GET requests for auth callbacks if configured on older client SDKs
app.get('/pusher/auth', (req, res) => {
  const socketId = req.query.socket_id;
  const channel = req.query.channel_name;
  const callback = req.query.callback;
  
  const auth = JSON.stringify(pusher.authenticate(socketId, channel));
  const cb = callback.replace(/\"/g, "") + "(" + auth + ");";
  
  res.set({ "Content-Type": "application/javascript" });
  res.send(cb);
});

module.exports = app;

// Local testing fallback
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}