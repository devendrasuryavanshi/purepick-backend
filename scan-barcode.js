const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

// Function to parse the HTML response and extract barcode results
function parseBarcodeResults(html) {
    const $ = cheerio.load(html);
    let results = [];

    $('#result').each((i, table) => {
        const rows = $(table).find('tr');
        if (rows.length > 0) {
            const rawText = $(rows[0]).find('td').eq(1).text().trim();
            const barcodeFormat = $(rows[2]).find('td').eq(1).text().trim();
            const parsedResult = $(rows[4]).find('td').eq(1).text().trim();

            if (rawText && barcodeFormat && parsedResult) {
                results.push({
                    rawText,
                    barcodeFormat,
                    parsedResult
                });
            }
        }
    });

    return results;
}

async function scanBarCode(imageBuffer) {
    try {
        // Create a form data instance and append the image buffer
        const formData = new FormData();
        formData.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        // Make the POST request to ZXing API
        const response = await axios.post('https://zxing.org/w/decode', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Extract and parse the HTML response
        const html = response.data;

        // Parse the HTML to get barcode results
        const results = parseBarcodeResults(html);
        return results;
    } catch (error) {
        console.error("Error processing image with ZXing API:", error.message);
        // throw new Error("Barcode scanning failed.");
    }
}

module.exports = {
    scanBarCode
};
