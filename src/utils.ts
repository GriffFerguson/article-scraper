import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Page } from "puppeteer";

export function sleep(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}

const ScreenshotOutputPath = join(__dirname, "../output/screenshots");
if (!existsSync(ScreenshotOutputPath)) {
    mkdirSync(ScreenshotOutputPath);
}
export async function takeScreenshot(page: Page) {
    await page.bringToFront();
    return await page.screenshot({
        path: join(ScreenshotOutputPath, `${await page.title()}_${Date.now()}.jpg`)
    });
}