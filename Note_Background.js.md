# Background.js
- [ ] `chrome.runtime.onInstalled.addListener` is called when the extension is first installed or updated.
- [ ] `chrome.cookies.getAll` is called to get all cookies when it's loaded.
  - In `chrome.cookies.getAll`, following methods will be done.
  - IndexedDB will be called to store the cookies with asynchronous.
  - Put the additional properties to the cookies, which are `usage` and `trimmedDomain`.
    - How `usage` is determined
    ```text
    if (convertedName.includes('ga') || convertedName.includes('utm') || convertedName.includes('analytics')) {
        usage = 'Analytics';
    } else if (convertedDomain.includes('doubleclick') || convertedDomain.includes('ad')) {
        usage = 'Advertising';
    } else if (convertedName.includes('pref') || convertedName.includes('settings') || convertedName.includes('lang')) {
        usage = 'Preferences';
    }
    ```
    - How `trimmedDomain` is determined
    ```
    const trimmedDomain = domain[0] === '.' ? domain.substring(1) : domain;
    ```
- [ ] Each cookie objects are stored in the IndexedDB with the key of key_name that is consist of domain and name property into `cookie` database.


