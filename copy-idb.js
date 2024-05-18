
(async () => {
    const cpy = (await import('cpy')).default;

    await cpy(
        'node_modules/idb/build/index.js',
        'built-extension/idb',
        { rename: basename => `index.js` }
    );
})();
