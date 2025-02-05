require('@babel/polyfill');
const getPixels = require('get-pixels');
const glMatrix = require('gl-matrix');
const _ = require('lodash');
const ndarray = require('ndarray');
const interpolate = require('ndarray-linear-interpolate');

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Quagga = require('@ericblade/quagga2');

const app = express();
const port = 3000;

// ✅ Enable CORS explicitly
app.use(cors({
    origin: '*',
    methods: 'POST',
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ✅ Multer Setup for File Upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
});

// ✅ Barcode Scanning Route
app.post('/api/scan', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid format' });
    }

    const imageBuffer = req.file.buffer;
    const imageDataUri = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

    Quagga.decodeSingle({
        src: imageDataUri,
        numOfWorkers: 0,
        decoder: { readers: ['ean_reader', 'code_128_reader'] }
    }, function(result) {
        if (result && result.codeResult) {
            res.json({ barcode: result.codeResult.code });
        } else {
            res.json({ error: 'No barcode detected' });
        }
    });
});

app.listen(port, () => {
    console.log(`Backend is running at http://localhost:${port}`);
});

module.exports = app; // ✅ Required for Vercel
