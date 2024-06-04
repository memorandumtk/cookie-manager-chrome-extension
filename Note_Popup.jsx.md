# Popup.jsx
### State variables
|      Name       |  Type   | Description |    Default Value     |
|:---------------:|:-------:|---------------------------------------------------------------------------------------------------|:--------------------:| 
|     cookies     |  Array  | An array of cookie objects. | [] (useCookies hook) |
| filteredCookies |  Array  | An array of cookie objects that match the search query. | [] (useCookies hook) |
|   searchValue   | String  | The search string entered to the search bar. |           ""           |
| fileName | String  | The name of the file to be downloaded. | null |
| chartData | Object | An object that contains the data to be used to draw the chart. | {} |

---

### Ref Value
| Name |                      Description                       | Default Value |
| :---: |:------------------------------------------------------:|:-------------:|
| debounceTimerRef | A reference to the debounce timer for cookie searching | null |

---

### Points of this page
- [ ] Background
  - This is arranged by `src/components/parts/Background.jsx`
- [ ] Search bar
  - This will call `handleSearchChange` function when the value is changed, then sets debounce and search the cookie that includes the search value in its domain and name.
- [ ] Remove all cookie button
  - This will `handleRemoveAllCookies` function when clicked, then calls `removeAllCookies` to remove all cookies and sets filteredCookie by the return value of `removeAllCookies`.
- [ ] Export Cookies button
  - This will call `handleExportCookies` function when clicked, then calls `exportCookies` to export the cookies
- [ ] Import Cookies button
  - This links `FileInput` components passes id, `handleImportCookies` function, and `fileName` variable to that. In that components, calls `importCookies` to import the cookies.
- [ ] Cookie Chart
  - This links to `CookieChart` components and passes `chartData` variable to that.
  - In `CookieChart` components, it will draw the Doughnut chart by using `chartData` variable.
  - The chart data is categorized by the `usage` property of the cookie object. `usage` is determined by the following rules.
    - If the cookie name includes 'ga', 'utm', or 'analytics', then it's 'Analytics'.
    - If the domain includes 'doubleclick' or 'ad', then it's 'Advertising'.
    - If the cookie name includes 'pref', 'settings', or 'lang', then it's 'Preferences'.
    - Any other cookies are categorized as 'Essential'.
- [ ] Link to the Options page
    - This links to the Options page by using `Link` components.

