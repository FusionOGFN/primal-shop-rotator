const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 4444;
const catalogPath = path.join(__dirname, '../Config/catalog_config.json');
const API = 'https://fortnite-api.com/v2/cosmetics/br';

async function fetchCosmeticsData() {
    try {
        const response = await axios.get(API);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching cosmetics data:', error);
        return [];
    }
}

app.get('/', async (req, res) => {
    let catalog;
    let cosmetics;

    try {
        const catalogData = fs.readFileSync(catalogPath, 'utf-8');
        catalog = JSON.parse(catalogData);
        cosmetics = await fetchCosmeticsData();
    } catch (error) {
        console.error('Error loading catalog or cosmetics:', error);
        res.status(500).send('Error loading catalog or cosmetics.');
        return;
    }

    const cosmeticsMap = cosmetics.reduce((map, cosmetic) => {
        map[cosmetic.id] = cosmetic;
        return map;
    }, {});

    const rarityBackgrounds = {
        Legendary: 'radial-gradient(circle, #ff9800, #ffcc80)',
        Epic: 'radial-gradient(circle, #9c27b0, #ce93d8)',
        Rare: 'radial-gradient(circle, #2196f3, #90caf9)',
        Uncommon: 'radial-gradient(circle, #4caf50, #a5d6a7)',
        Common: 'radial-gradient(circle, #9e9e9e, #e0e0e0)',
        Marvel: 'radial-gradient(circle, #ff0000, #ff6666)',  
        Frozen: 'radial-gradient(circle, #00bcd4, #80deea)',  
        Icon: 'radial-gradient(circle,rgb(2, 107, 110),rgb(145, 255, 240))',  
        Dark: 'radial-gradient(circle,rgb(66, 3, 53),rgb(184, 6, 139))',   
    };

    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Primal Item Shop</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 20px;
                }
                h1 {
                    margin-bottom: 5px;
                }
                p {
                    font-size: 18px;
                    color: gray;
                }
            </style>
        </head>
        <body>
            <h1>Primal Item Shop</h1>
            <p id="timestamp"></p> <!-- The time will be displayed here -->
            
            <script>
                document.addEventListener("DOMContentLoaded", function () {
                    const timestampElement = document.getElementById('timestamp');
                    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    timestampElement.textContent = "Sent at " + currentTime;
                });
            </script>
            
            <h2>Shop Items</h2>
            <div class="items">
    `;

    for (const [key, itemConfig] of Object.entries(catalog)) {
        const { itemGrants, price } = itemConfig;
        const [type, id] = itemGrants[0].split(':');
        const cosmetic = cosmeticsMap[id];

        let background = 'radial-gradient(circle, #333, #666)';
        let displayName = '';

        if (cosmetic) {
            let rarity = cosmetic.rarity.displayValue;
            if (rarity.toUpperCase() === 'MARVEL SERIES') {
                displayName = 'MARVEL SERIES';
                background = rarityBackgrounds.Marvel;
            } else if (rarity.toUpperCase() === 'FROZEN SERIES') {
                displayName = 'FROZEN SERIES';
                background = rarityBackgrounds.Frozen;
            } else if (rarity.toUpperCase() === 'Icon Series') {
                displayName = 'ICON SERIES';
                background = rarityBackgrounds.Icon;
            } else if (rarity.toUpperCase() === 'DARK SERIES') {
                displayName = 'DARK SERIES';
                background = rarityBackgrounds.Dark;
            } else {
                displayName = rarity;
                background = rarityBackgrounds[rarity] || 'radial-gradient(circle, #333, #666)';
            }

            html += `
                <div class="item" style="background: ${background};">
                    <img src="${cosmetic.images.icon}" alt="${cosmetic.name}">
                    <h3>${cosmetic.name}</h3>
                    <p>Rarity: ${displayName}</p>
                    <p>${cosmetic.description || 'No description available.'}</p>
                    <p>Price: ${price} V-Bucks</p>
                </div>
            `;
        } else {
            html += `
                <div class="item" style="background: radial-gradient(circle, #333, #666);">
                    <h3>Item ID: ${id}</h3>
                    <p>Price: ${price} V-Bucks</p>
                </div>
            `;
        }
    }

    html += `</div></body></html>`;
    res.send(html);
});

app.listen(port, () => {
    console.log(`Primal Item Shop Website http://localhost:${port}`);
});
