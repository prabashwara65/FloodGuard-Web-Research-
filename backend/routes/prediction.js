// routes/prediction.js
const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/forecast', (req, res) => {
    const { station, days, rainfall } = req.body;
    const daysNum = days || 3;
    let rainfallArg = '';
    if (rainfall && Array.isArray(rainfall) && rainfall.length > 0) {
        rainfallArg = rainfall.join(',');
    }

    // Build the command: python predict_cli.py <station> <days> <rainfall>
    const command = `python predict_cli.py ${station} ${daysNum} ${rainfallArg}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: error.message, stderr });
        }
        try {
            const result = JSON.parse(stdout);
            if (result.error) {
                return res.status(500).json({ error: result.error });
            }
            // Optionally save to MongoDB
            res.json(result);
        } catch (parseError) {
            console.error('Parse error:', parseError);
            res.status(500).json({ error: 'Invalid JSON from Python script', raw: stdout });
        }
    });
});

module.exports = router;