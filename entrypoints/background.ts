import {fetchCUNYCalendar} from "@/lib/semesterEventDataHandler.ts";

export default defineBackground(() => {
    // background.js
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "fetchCUNYCalendar") {
            fetchCUNYCalendar().then(semesterEvent => {
                sendResponse({semesterEvent})
            }).catch((err) => {
                sendResponse({error: err.message});
            })
            return true; // IMPORTANT: keeps the message channel open for async sendResponse
        }
    });
});

