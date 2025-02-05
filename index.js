const express = require('express');
const multer = require('multer');
const Quagga = require('@ericblade/quagga2').default;  // Ensure correct import
const cors = require('cors');  // Enable CORS for frontend requests

const app = express();
const port = process.env.PORT || 3000;

// Set up multer storage to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enable CORS
app.use(cors());

app.post('/scan', upload.single('image'), (req, res) => {
  const buffer = req.file.buffer;  // Buffer of uploaded image

  // Decode the barcode from the image
  Quagga.decodeSingle({
    src: buffer,  // The image buffer
    decoder: {
      readers: ['ean_13_reader', 'ean_8_reader', 'code_128_reader'], // Barcode types to decode
    },
  }, (result) => {
    if (result && result.codeResult) {
      // Barcode detected, send the result
      return res.json({ barcode: result.codeResult.code });
    } else {
      // No barcode detected
      return res.status(400).json({ error: 'No barcode detected' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
