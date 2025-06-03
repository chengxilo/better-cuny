class PreferenceStorageHandler {
    public PREFERENCE_KEY = <StorageItemKey>"local:preference";

    constructor() {}

    public async get(): Promise<any> {
        const data = await storage.getItem(this.PREFERENCE_KEY)
        console.log("get preference data: ", data)
        return data;
    }
    public async set(data: any) {
        await storage.setItem(this.PREFERENCE_KEY, data)
    }
}


export {PreferenceStorageHandler};