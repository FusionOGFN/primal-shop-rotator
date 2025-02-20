const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');
const FormData = require('form-data');

const catalogPath = path.join(__dirname, '../Config/catalog_config.json');
const itemsJsonPath = path.join(__dirname, 'items.json');

async function generateItemShopScreenshot() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('http://localhost:4444');
    const screenshotPath = path.join(__dirname, '../Config/item-shop.png');
    await page.screenshot({ path: screenshotPath });
    await browser.close();
    return screenshotPath;
}

let itemsJson = [];
try {
    itemsJson = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf-8'));
} catch (error) {}

function getCatalog() {
    try {
        const catalogData = fs.readFileSync(catalogPath, 'utf-8');
        return JSON.parse(catalogData);
    } catch (error) {
        return null;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const API = 'https://fortnite-api.com/v2/cosmetics/br';
async function fetchCosmeticData(cosmeticId) {
    try {
        const response = await axios.get(`${API}/${cosmeticId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        } else {
            console.log('No data found for cosmetic ID:', cosmeticId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching cosmetic data:', error);
        return null;
    }
}

function randomPrice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function assignPrice(item) {
    let price = 0;
    const cosmeticData = await fetchCosmeticData(item.id);

    if (cosmeticData) {
        switch (item.type) {
            case 'AthenaPickaxe':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                        price = 1200;
                        break;
                    case 'MARVEL SERIES':
                        price = 800; // Fixed price for MARVEL SERIES
                        break;
                        case 'DARK SERIES':
                        price = 800; 
                        break;
                    case 'Icon Series':
                        price = 1500;
                        break;
                    case 'Epic':
                        price = 1000;
                        break;
                    case 'Rare':
                        price = 800;
                        break;
                    case 'Uncommon':
                        price = 500;
                        break;
                    default:
                        price = 500;
                }
                break;

            case 'AthenaCharacter':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                        price = 2000;
                        break;
                    case 'MARVEL SERIES':
                        price = 1500; 
                        break;
                        case 'DARK SERIES':
                        price = 1500; 
                        break;
                    case 'Icon Series':
                        price = 1500;
                        break;
                    case 'Epic':
                        price = 1500;
                        break;
                    case 'Rare':
                        price = 1200;
                        break;
                    case 'Uncommon':
                        price = 800;
                        break;
                    default:
                        price = 800;
                }
                break;

            case 'AthenaItemWrap':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                    case 'Epic':
                    case 'Rare':
                    case 'Uncommon':
                        price = 200;
                        break;
                    default:
                        price = 200;
                }
                break;

            case 'AthenaDance':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                    case 'Epic':
                        price = 800;
                        break;
                    case 'Rare':
                        price = 500;
                        break;
                    case 'Uncommon':
                        price = 200;
                        break;
                    default:
                        price = 500;
                }
                break;

            case 'AthenaLoadingScreen':
                price = 0;
                break;

            case 'AthenaGlider':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                        price = 1500;
                        break;
                        case 'DARK SERIES':
                        price = 500; 
                        break;
                    case 'Epic':
                        price = 1200;
                        break;
                    case 'Rare':
                        price = 800;
                        break;
                    case 'Uncommon':
                        price = 500;
                        break;
                    default:
                        price = 500;
                }
                break;

            case 'AthenaBackpack':
                switch (cosmeticData.rarity.displayValue) {
                    case 'Legendary':
                        price = 1000;
                        break;
                        case 'DARK SERIES':
                        price = 800; 
                        break;
                    case 'Epic':
                        price = 800;
                        break;
                    case 'Rare':
                        price = 500;
                        break;
                    case 'Uncommon':
                        price = 200;
                        break;
                    default:
                        price = 200;
                }
                break;

            default:
                price = 1000;
        }
    } else {
        price = 1000;
    }
    return price;
}


async function sendWebhookNotification() {
    const webhookUrl = 'https://discord.com/api/webhooks/1337804473153880176/tZ6iqFnRZS8ltnDvWD9Lx7cS1V5pfQFG0P8jS1D3mYvtQnE5rUFjL129ePq9Z6VNa6Zs';
    const roleId = "<@&1314984768596742174>";

    try {
        const screenshotPath = await generateItemShopScreenshot();
        const formData = new FormData();
        formData.append('file', fs.createReadStream(screenshotPath));

        const payloadJson = JSON.stringify({
            content: roleId, 
            embeds: [
                {
                    color: 3447003,
                    title: "New Primal Item Shop!",
                    description: "Restart your game in order to see the changes! ",
                    fields: [
                        {
                            name: "",
                            value: "",
                            inline: false
                        }
                    ],
                    image: {
                        url: `attachment://item-shop.png`
                    },
                    timestamp: new Date().toISOString() // This ensures Discord auto-formats the time
                }
            ]
        });

        formData.append('payload_json', payloadJson);

        await axios.post(webhookUrl, formData, {
            headers: formData.getHeaders(),
        });

        console.log(`\x1b[36m[Primal Shop Rotator]\x1b[0m: Webhook sent with image inside the embed!`);
    } catch (error) {
        console.error('Error sending webhook with screenshot:', error);
    }
}


async function generateCatalogConfig() {
    const eligibleItems = itemsJson.filter(item => item.shopHistory && item.shopHistory.length > 0);

    if (eligibleItems.length === 0) {
        return;
    }

    const catalogConfig = {};

    const categorizedItems = {
        AthenaCharacter: [],
        AthenaPickaxe: [],
        AthenaDance: [],
        AthenaGlider: [],
        AthenaLoadingScreen: [],
        AthenaSkyDiveContrail: [],
        AthenaBackpack: [],
    };

    eligibleItems.forEach(item => {
        if (categorizedItems[item.type]) {
            categorizedItems[item.type].push(item);
        }
    });

    const dailyItems = [
        ...categorizedItems.AthenaCharacter,
        ...categorizedItems.AthenaPickaxe,
        ...categorizedItems.AthenaDance,
    ];
    shuffleArray(dailyItems);
    const selectedDailyItems = dailyItems.slice(0, 6);

    const featuredItems = [
        ...categorizedItems.AthenaGlider,
        ...categorizedItems.AthenaBackpack,
    ];
    shuffleArray(featuredItems);
    const selectedFeaturedItems = featuredItems.slice(0, 4);

    for (let index = 0; index < selectedDailyItems.length; index++) {
        const item = selectedDailyItems[index];
        const price = await assignPrice(item);
        catalogConfig[`daily${index + 1}`] = {
            itemGrants: [`${item.type}:${item.id}`],
            price: price,
        };
    }

    for (let index = 0; index < selectedFeaturedItems.length; index++) {
        const item = selectedFeaturedItems[index];
        const price = await assignPrice(item);
        catalogConfig[`featured${index + 1}`] = {
            itemGrants: [`${item.type}:${item.id}`],
            price: price,
        };
    }

    try {
        fs.writeFileSync(catalogPath, JSON.stringify(catalogConfig, null, 2), { flag: 'w' });
        await sendWebhookNotification();
    } catch (error) {
        console.error('Error saving catalog config:', error);
    }
}


generateCatalogConfig();
