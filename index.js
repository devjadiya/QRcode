const express = require('express');
const multer = require('multer');
const Quagga = require('quagga');
const cors = require('cors');  // Import CORS

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enable CORS for all routes
app.use(cors());

app.post('/scan', upload.single('image'), (req, res) => {
  const buffer = req.file.buffer;

  Quagga.decodeSingle({
    src: buffer,
    decoder: {
      readers: ['ean_13_reader', 'ean_8_reader', 'code_128_reader']
    }
  }, (result) => {
    if (result && result.codeResult) {
      return res.json({ barcode: result.codeResult.code });
    } else {
      return res.status(400).json({ error: 'No barcode detected' });
    }
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
