# Cookie manager chrome extension

This is a simple cookie manager chrome extension, allows you to manipulate cookies in your browser. This extension uses indexedDB to store cookies, so you don't need to access to chrome's cookie API everytime when you need information.
This extension is built with React.js and Tailwind.

## Features
- See detail information of cookies
- Edit cookie value
- See the total number of cookies and categorized information
- Search cookies by name, domain, and expiration date range
- Export cookies to a JSON file
- Import cookies from a JSON file
- Clear all cookies
- Delete selected cookies or one by one


## Development
1. Clone this repository
2. Run `npm install`
3. Run `build-for-extension-with-idb-with-options-page`
4. Go to `chrome://extensions/`
5. Import the `built-extension` folder as an unpacked extension