document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('options-form');

    // Load the saved settings
    chrome.storage.sync.get(['exampleSetting'], (result) => {
        if (result.exampleSetting) {
            document.getElementById('example-setting').value = result.exampleSetting;
        }
    });

    // Save the settings
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const exampleSetting = document.getElementById('example-setting').value;

        chrome.storage.sync.set({ exampleSetting }, () => {
            console.log('Settings saved');
        });
    });
});
