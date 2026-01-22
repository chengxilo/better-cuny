import {PreferenceStorageHandler} from "@/lib/PreferenceStorageHandler.ts";

export default defineContentScript({
    matches: [
        "https://ssologin.cuny.edu/*"
    ],
    main(ctx) {
        new PreferenceStorageHandler().get().then(data => {
            if (!data || !data.autoLogin || !data.credential || !data.credential.username || !data.credential.password) {
                return;
            }
            console.log(location.href)
            const usernameInput = document.querySelector("#CUNYLoginUsernameDisplay") as HTMLInputElement;
            if (usernameInput) {
                const passwordInput = document.querySelector("#CUNYLoginPassword") as HTMLInputElement
                usernameInput.value = data.credential.username
                passwordInput.value = data.credential.password
                const btn = document.querySelector("#submit") as HTMLButtonElement;
                btn.click() // click the button after input is done.
            } else {
                // in https://ssologin.cuny.edu/oaa/authnui/index.html*
                const observer = new MutationObserver((mutations) => {
                    const e = document.querySelector("form .oj-link-standalone") as HTMLInputElement  | null;
                    if (e) {
                        observer.disconnect()
                        e.click()
                    }
                })
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                })
            }
        })
    },
});