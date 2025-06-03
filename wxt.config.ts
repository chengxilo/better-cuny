import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Better CUNY",
    description: "Provide additional features for the CUNY website",
    version: "0.0.1",
    permissions: ["storage"],
    host_permissions: [
        "https://sb.cunyfirst.cuny.edu/*",// BrightSpace
        "https://ssologin.cuny.edu/cuny.html" // CUNY login page
    ]
  }
});
