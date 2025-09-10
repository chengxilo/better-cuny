import {PreferenceStorageHandler} from "@/lib/PreferenceStorageHandler.ts";

export default defineContentScript({
    matches: [
        "https://ssologin.cuny.edu/cuny.html*",
        "https://ssologin.cuny.edu/oaa/authnui/index.html*",
    ],
    main(ctx) {
        console.log("login.content.ts")
        new PreferenceStorageHandler().get().then(data => {
            if (!data || !data.autoLogin || !data.credential || !data.credential.username || !data.credential.password) {
                return;
            }
            console.log(location.href)
            if (location.href.startsWith("https://ssologin.cuny.edu/cuny.html")) {
                const usernameInput = document.querySelector("#CUNYfirstUsernameH") as HTMLInputElement
                const passwordInput = document.querySelector("#CUNYfirstPassword") as HTMLInputElement
                usernameInput.value = data.credential.username
                passwordInput.value = data.credential.password
                console.log(usernameInput.value)
                console.log((passwordInput.value).length)
                document.querySelector("button")?.click()
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