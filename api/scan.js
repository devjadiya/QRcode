require('@babel/polyfill');
const getPixels = require('get-pixels');
const glMatrix = require('gl-matrix');
const _ = require('lodash');
const ndarray = require('ndarray');
const interpolate = require('ndarray-linear-interpolate');
const sharp = require('sharp');
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
const sharp = require('sharp');

app.post('/api/scan', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid format' });
    }

    try {
        const processedImage = await sharp(req.file.buffer)
            .greyscale()  // Convert to grayscale
            .sharpen()    // Enhance sharpness
            .toBuffer();

        const imageDataUri = `data:${req.file.mimetype};base64,${processedImage.toString('base64')}`;

        Quagga.decodeSingle({
            src: imageDataUri,
            numOfWorkers: 0,
            locate: true,
            decoder: { readers: ['ean_reader', 'code_128_reader', 'code_39_reader'] },
            locator: { halfSample: true, patchSize: 'medium' }
        }, function(result) {
            if (result && result.codeResult) {
                res.json({ barcode: result.codeResult.code });
            } else {
                res.json({ error: 'No barcode detected' });
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Image processing failed' });
    }
});


app.listen(port, () => {
    console.log(`Backend is running at http://localhost:${port}`);
});

module.exports = app; // ✅ Required for Vercel
