const express =require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({ limit: '15mb' }));

// Handle Request
////////////////
// Store the single image in memory
let latestPhoto = null;

// Upload the latest photo for this session
app.post('/', (req, res) => {
  // error handler
  if (!req.body) return res.sendStatus(400);

  console.log('got photo');

  // Update image and respond happily
  latestPhoto = req.body.image;
  res.sendStatus(200);
});

// View latest Image
app.get('/', (req, res) => {
  // Does the session have an image yet?
  if (!latestPhoto) {
    return res.status(404).send('Nothing here yet');
  }

  console.log('Sending photo');

  try {
    // Send image
    let img = Buffer.from(latestPhoto, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  } catch(e) {
    // Log the error and stay alive
    console.log(e);
    return res.sendStatus(500);
  }
});

// Set up server
const port = process.env.PORT || 5005;

app.listen(port);

console.log(`Crow Watch 5000 server listening on ${port}`);
