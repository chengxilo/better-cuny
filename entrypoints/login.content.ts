import {PreferenceStorageHandler} from "@/lib/PreferenceStorageHandler.ts";

export default defineContentScript({
    matches: ["https://ssologin.cuny.edu/cuny.html*"],
    main(ctx) {
        console.log("login.content.ts")
        new PreferenceStorageHandler().get().then(data => {
            if (!data || !data.autoLogin || !data.credential || !data.credential.username || !data.credential.password) {
                return;
            }
            const usernameInput = document.querySelector("#CUNYfirstUsernameH") as HTMLInputElement
            const passwordInput = document.querySelector("#CUNYfirstPassword") as HTMLInputElement
            usernameInput.value = data.credential.username
            passwordInput.value = data.credential.password
            console.log(usernameInput.value)
            console.log((passwordInput.value).length)
            document.querySelector("button")?.click()
        })
    },
});