const { detectText } = require("./extract-data");
const { scanBarCode } = require("./scan-barcode");

async function analyze(data, socket) {
    try {
        const buffer1 = Buffer.from(data[0].file, 'base64');
        const buffer2 = Buffer.from(data[1].file, 'base64');

        const textDetections1 = await detectText(buffer1);
        const textDetections2 = await detectText(buffer2);

        if (textDetections1.length + textDetections2.length <= 10) {
            socket.emit("text-extraction", { isSuccess: false, message: "The image provided does not contain enough info. for extraction." });
            return;
        }

        let barcodeResults1 = data[0].barcodeInfo;
        let barcodeResults2 = data[1].barcodeInfo;

        if (!barcodeResults1 && !barcodeResults2) {
            barcodeResults2 = await scanBarCode(buffer2);
            console.log("barcodeResults2: ", barcodeResults2);
            if (!barcodeResults2) {
                barcodeResults1 = await scanBarCode(buffer1);
            }
        }

        socket.emit("text-extraction", { isSuccess: true, message: "Text Extracted Successfully" });
    } catch (error) {
        console.error("Error during analysis:", error.message);
        socket.emit("text-extraction", { isSuccess: false, message: "An error occurred during the analysis process." });
    }
}

module.exports = { analyze };