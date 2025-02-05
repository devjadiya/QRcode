const express = require('express');
const multer = require('multer');
const Quagga = require('@ericblade/quagga2').default;
const cors = require('cors');  // Import the cors package

const app = express();
const port = process.env.PORT || 3000;

// Allow all origins (use cautiously in production)
app.use(cors({
    origin: 'http://127.0.0.1:5500' // Only allow this frontend URL
  }));

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST endpoint for barcode scanning
app.post('/scan', upload.single('image'), (req, res) => {
  const buffer = req.file.buffer;  // Buffer of the uploaded image

  // Decode the barcode from the image
  Quagga.decodeSingle({
    src: buffer,
    decoder: {
      readers: ['ean_13_reader', 'ean_8_reader', 'code_128_reader'],
    },
  }, (result) => {
    if (result && result.codeResult) {
      return res.json({ barcode: result.codeResult.code });
    } else {
      return res.status(400).json({ error: 'No barcode detected' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
