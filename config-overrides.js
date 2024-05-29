const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
    (config) => {
        // Override the entry point for options page
        config.entry = {
            main: './src/index.js',
            options: './src/options.js'
        };

        // Modify the output configuration
        config.output = {
            ...config.output,
            filename: 'static/js/[name].[contenthash:8].js',
        };

        // Configure HtmlWebpackPlugin for multiple HTML files
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        config.plugins = config.plugins.filter(
            plugin => !(plugin instanceof HtmlWebpackPlugin)
        );

        config.plugins.push(
            new HtmlWebpackPlugin({
                inject: true,
                chunks: ['main'],
                template: path.resolve(__dirname, 'public/index.html'),
                filename: 'index.html',
            }),
            new HtmlWebpackPlugin({
                inject: true,
                chunks: ['options'],
                template: path.resolve(__dirname, 'public/options.html'),
                filename: 'options.html',
            })
        );

        return config;
    }
);
