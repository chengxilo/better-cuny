<div align="center">
  <h1>Better CUNY</h1>
  <img src="assets/docs/cunylogo.png" alt="logo" style="width: 100px; border-radius: 15%" />
</div>

---

This is a browser extension designed for CUNY websites, built with [WXT](https://wxt.dev/), React, and Material-UI.

---
## 🤺 Usage

### Option1: Install in chrome web store
 Not available yet.

[Download better-cuny](https://chromewebstore.google.com/detail/better-cuny/agocaomnajflfpeefnofioffegkkcoic)

### Option2: Compile Source Code 🛠️

1. Clone the repository:
    ```bash
    git clone https://github.com/chengxilo/better-cuny.git
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Build the source code:
    ```bash
    pnpm run build
    ```

4. Open `chrome://extensions/` in your browser, enable `Developer mode`, click `Load unpacked`,
   and select the `.output/chrome-mv3` folder in the **project directory**.


### Options3
Download `chrome-mv3.zip` in your browser, enable `Developer mode`, click `Load unpacked`,
and select the extracted directory. (Actually it is almost the same as Option 2-step 4)

---

## 😎 Features

### 📆 Export Schedule to CSV

On your Schedule Builder page, click the `EXPORT` button:

![img.png](assets/docs/img.png)

This will download a `.csv` file, which you can import into Google Calendar.

Unlike the default Schedule Builder, this extension provides **more accurate results** by combining data from your webpage and the official [CUNY Academic Calendar](https://www.cuny.edu/academics/academic-calendars/):

![img_1.png](assets/docs/img_1.png)

It accounts for special situations (like rescheduled classes) that the Schedule Builder might overlook.
<font style="color:red">However, this is based on webpage content — your professor and classmates are always more trustworthy sources for the most accurate information.</font>
---

### 🤖 More Features Coming Soon

Stay tuned!

---

## 🪁 Contributing

Issues and pull requests are welcome! You’re encouraged to:

- 📄 Improve the documentation
- ✨ Add new features
- 🪲 Fix bugs
- 💡 Suggest ideas or improvements!

---

## ⭐ Support

If you enjoy using this extension, please:

- Give it a ⭐ on GitHub
- Recommend it to your friends

Thank you so much for your support !!!

<img style="width: 18em;" src="assets/docs/kneel.gif"  alt="kneel"/>

