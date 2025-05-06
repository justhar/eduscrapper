const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {

    const username = JSON.parse(event.body).username;
    const password = JSON.parse(event.body).password;
    const school = JSON.parse(event.body).school;

    const browser = await puppeteer.connect({
        browserWSEndpoint: "wss://chrome.browserless.io?token=SG6HTbe2tAItQOb3b7dd51663f011f2548fccaa457",
    });
    
    const page = await browser.newPage();

    await page.goto(`https://${school}.edunav.net/login`, { waitUntil: 'networkidle2' });

    await page.locator('input[name="username"]').fill(username)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('button[type="submit"]').click()

    const navigationPromise = page.waitForNavigation();
    await navigationPromise;
    const url = page.url();

    if(url === `https://${school}.edunav.net/`) {
        const name = 'body > div.page > div > div > div.col-lg-8 > div.row > div:nth-child(1) > div.widget.widget-shadow.mb-15 > div.widget-header.bg-primary.p-15.clearfix > div.font-size-18.mt-10';
        const classs = 'body > div.page > div > div > div.col-lg-8 > div.row > div:nth-child(1) > div.widget.widget-shadow.mb-15 > div.widget-header.bg-primary.p-15.clearfix > div.font-size-14';
        const extractedName = await page.$eval(name, el => el.textContent.trim());
        const extractedClass = await page.$eval(classs, el => el.textContent.trim());
        const text = {
            name: extractedName,
            class: extractedClass
        }
        await browser.close();
        return {
            statusCode: 200,
            body: JSON.stringify(text)
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' })
        };
    }
}