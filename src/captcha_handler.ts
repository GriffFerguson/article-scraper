import { Page } from "puppeteer";
import { sleep, takeScreenshot } from "./utils";
import { JSDOM } from "jsdom";

export async function holdAndConfirm(page: Page) {
    await page.bringToFront();
    sleep(1500);
    let frames = page.frames();
    for (var frame of frames ) {
        let {document} = new JSDOM(await frame.content()).window
        if (document.getElementsByTagName("a").length > 0) {
            let wrapper = document.getElementsByTagName("div")[0];
            frame.evaluate(() => {
                setInterval(() => {
                    let id = document.getElementsByTagName("div")[0].getElementsByTagName("div")[0].getAttribute("id");
                    console.log(id);
                }, 1000)
            })
            let clickElemId = wrapper.getElementsByTagName("div")[0].getAttribute("id")!;
            console.log(clickElemId);
            let elem = frame.locator(`#${clickElemId}`);
            console.log("Attempting to hold and complete CAPTCHA");
            await elem?.click({delay: 10000});
            console.log("Done, pausing for content reloading")
        }
    }

    // page.mouse.click(940, 520, {delay: 10000});

    await sleep(7000);
    // await takeScreenshot(page);
    console.log("Getting reloaded page content");
    return await page.content();
}