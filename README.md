# Cookie manager chrome extension

I've been thinking if there is an application to be able to see what kind of cookie and how many cookies I have.
Then here is a simple cookie manager chrome extension! Which allows you to manipulate cookies in your browser with such following features. This extension uses indexedDB to store cookies, so you don't need to access to chrome's cookie API every time when you need information.
This extension is built with React.js and Tailwind.
---

## Features
- See detail information of cookies
- Edit cookie value
- See the total number of cookies and categorized information
- Search cookies by name, domain, and expiration date range
- Export cookies to a JSON file
- Import cookies from a JSON file
- Clear all cookies
- Delete selected cookies or one by one

---

## Development
1. Clone this repository
2. Run `npm install`
3. Run `build-for-extension-with-idb-with-options-page`
4. Go to `chrome://extensions/`
5. Import the `built-extension` folder as an unpacked extension


### Folder structure
```
├── Note_Background.js.md
├── Note_Options.jsx.md
├── Note_Popup.jsx.md
├── README.md
├── build
│   ├── asset-manifest.json
│   ├── favicon.ico
│   ├── images
│   │   ├── logo128.png
│   │   ├── logo16.png
│   │   ├── logo192.png
│   │   ├── logo48.png
│   │   └── logo512.png
│   ├── index.html
│   ├── manifest.json
│   ├── options.html
│   ├── robots.txt
│   └── static
│       ├── css
│       │   ├── main.d93d1e94.css
│       │   ├── main.d93d1e94.css.map
│       │   ├── options.5e87531c.css
│       │   └── options.5e87531c.css.map
│       └── js
│           ├── 453.ae43e7c2.chunk.js
│           ├── 453.ae43e7c2.chunk.js.map
│           ├── main.793477d8.js
│           ├── main.793477d8.js.LICENSE.txt
│           ├── main.793477d8.js.map
│           ├── options.ba4fae91.js
│           ├── options.ba4fae91.js.LICENSE.txt
│           └── options.ba4fae91.js.map
├── built-extension
│   ├── asset-manifest.json
│   ├── background.js
│   ├── favicon.ico
│   ├── idb
│   ├── images
│   │   ├── logo128.png
│   │   ├── logo16.png
│   │   ├── logo192.png
│   │   ├── logo48.png
│   │   └── logo512.png
│   ├── index.html
│   ├── manifest.json
│   ├── options.html
│   ├── robots.txt
│   └── static
│       ├── css
│       │   ├── main.d93d1e94.css
│       │   ├── main.d93d1e94.css.map
│       │   ├── options.5e87531c.css
│       │   └── options.5e87531c.css.map
│       └── js
│           ├── 453.ae43e7c2.chunk.js
│           ├── 453.ae43e7c2.chunk.js.map
│           ├── main.793477d8.js
│           ├── main.793477d8.js.LICENSE.txt
│           ├── main.793477d8.js.map
│           ├── options.ba4fae91.js
│           ├── options.ba4fae91.js.LICENSE.txt
│           └── options.ba4fae91.js.map
├── config-overrides.js
├── copy-idb.js
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── images
│   │   ├── logo128.png
│   │   ├── logo16.png
│   │   ├── logo192.png
│   │   ├── logo48.png
│   │   └── logo512.png
│   ├── index.html
│   ├── manifest.json
│   ├── options.html
│   └── robots.txt
├── src
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── background
│   │   └── background.js
│   ├── components
│   │   ├── Options.jsx
│   │   ├── Popup.jsx
│   │   └── parts
│   │       ├── Background.jsx
│   │       ├── Checkbox.jsx
│   │       ├── CheckboxForOneCookie.jsx
│   │       ├── CookieChart.jsx
│   │       ├── CookieDetail.jsx
│   │       ├── CookieDetailModal.jsx
│   │       ├── DateFilter.jsx
│   │       └── FileInput.jsx
│   ├── css
│   │   ├── options.css
│   │   └── popup.css
│   ├── hooks
│   │   └── useCookies.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── options.js
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   ├── styles
│   │   └── tailwind.css
│   └── utils
│       ├── DetailChange.js
│       ├── ExportCookies.js
│       ├── GetAllCookies.js
│       ├── HighlightText.js
│       ├── ImportCookies.js
│       ├── InitDB.js
│       ├── RemoveAllCookies.js
│       ├── RemoveCookie.js
│       └── RemoveSelectedCookies.js
└── tailwind.config.js
```

