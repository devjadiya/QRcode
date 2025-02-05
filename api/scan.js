const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Quagga = require("@ericblade/quagga2");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "/tmp/" }); // Use /tmp in Vercel

app.use(cors());

app.post("/api/scan", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    Quagga.decodeSingle({
        src: req.file.path,
        numOfWorkers: 0,
        decoder: { readers: ["ean_reader", "code_128_reader", "upc_reader"] }
    }, (result) => {
        fs.unlinkSync(req.file.path);

        if (result && result.codeResult) {
            res.json({ barcode: result.codeResult.code });
        } else {
            res.status(400).json({ error: "No barcode found" });
        }
    });
});

module.exports = app;
