# Options.jsx

### State variables
|      Name       |  Type   | Description                                                                    | Default Value     | 
|:---------------:|:-------:|--------------------------------------------------------------------------------| :---: |
|     cookies     |  Array  | An array of cookie objects.                                                    | [] (useCookies hook) |
| filteredCookies |  Array  | An array of cookie objects that match the search query.                        | [] (useCookies hook) |
|   searchValue   | String  | The search string entered to the search bar.                                   |           ""           |
| fileName | String  | The name of the file to be downloaded.                                         | null |
|     buckets     |  Array  | An array of cookie objects selected at group buttons or each cookie's button.  | [] |
|  groupCookies   | Object  | An object that contains the cookies grouped by the group buttons. * needed to check later | {} |
|  groupCriteria  | String | A criteria used to group cookies and will be selected by selecte input.  | "domain" |
|    dateRange    | Oject  | An object that contains the start and end date of the date range to be used to specify expirationData. | {startDate: new Date(), endDate: null} |
| sortKey | String | A key used to sort the cookies of domain, name, and expirationDate properties. |{domain: 'asc', name: null, expirationDate: null} |

---

### Ref Value
| Name |                      Description                       |
| :---: |:------------------------------------------------------:|
| debounceTimerRef | A reference to the debounce timer for cookie searching | null |

---

### Points of this page
#### Above part (Operations of cookies)
- [ ] Background
    - This is arranged by `src/components/parts/Background.jsx`
- [ ] Display the number of cookies
  - This will display the number of cookies in the `cookies` state variable, if `cookies` and `filteredCookies` values are different, `filteredCookies`'s number will also be shown up.
- [ ] Search bar
  - (same as the Popup.jsx)
- [ ] Date search box for seraching cookies by expiration date
  - In addition to that Search value, the dateRange value is going to be thrown to the `performSearch` function, which is set by `handleDateChange` function when the date range is changed.
- [ ] Remove all cookie button
    - (same as the Popup.jsx)
- [ ] Export Cookies button
    - (same as the Popup.jsx)
- [ ] Import Cookies button
    - (same as the Popup.jsx)

#### Below part (Information of cookies with a table)
- [ ] Table header
  - This will display the table header columns with the domain, name, expiration date.
  - Each values can be sorted by clicking the column header.
  - Those are sorted by `domain` ordered by ***asc*** by the default.
  - When the column is clicked, the `sortCookies` function is called and cookie data will be sorted based on `filteredCookies` array after that, `sortKey` value will be set with a value of clicked header.
- [ ] Table body
  - This will display the cookie data in the table body.
  - [ ] Each group rows has a checkbox (rounded) to select the cookie and links `handleCheckboxOfGroupingChange` component, which the `handleCheckboxChange` function is called and all of the cookies belonging to the group will be added to the `buckets` array.
  - [ ] Each row has a checkbox to select the cookie and links `CheckboxForOneCookie` component, which the `handleCheckboxChange` function is called and the cookie will be added to the `buckets` array.
  - When a row of any cookies is clicked, the `handleRowClick` function is called and the cookie's detail will be popped up with a modal by setting `selectedCookie` with the cookie. The modal, `CookieDetailModal` component, will be displayed when `selectedCookie` has truthy value.
  - [ ] Each row has a button to remove the cookie and links `handleRemoveCookie` function, which the `removeCookie` function is called and the cookie will be removed from the `cookies` array and `filteredCookies` array.
  - [ ] The cookie data will be displayed in the table body with highlighting the row if the data of the cookie includes the search value.

#### Modal for cookie detail
- This will be displayed when the `selectedCookie` has truthy value.
- In the modal, all cookie data is appeared. The `value` and `expirationDate` properties can be edited with input fields. To do that, the `handleDetailChange` function is called and the cookie data will be updated.
- **Although it is not recommended to change a value of the cookie unless you are sure what you are doing.** As my experience, I couldn't log in to chatgpt website when I changed the value of the cookie: .1rx.io
- If clicked outside the modal or pressed down the ESC kye, the modal will be closed.
- When the modal is closed, `selectedCookie` will be set with null.



