/* A postcss config file used to build and compress the tailwinds css file. */

// Remove comment and minify css
const cssnano = require('cssnano')({ preset: 'default' })

// Removes all unused css classes
const purgecss = require('@fullhuman/postcss-purgecss')({

    // Specify the paths to all of the template files in your project
    content: [
        './src/**/*.html',
        './src/**/*.jsx',
        './src/**/*.tsx',
        './src/**/*.js',
        './src/**/*.ts',
        './src/**/*.css',
        './src/**/*.less',
    ],

    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})

module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'), // Prefixes browser terms like -webkit- to CSS where appropriate
        ...process.env.NODE_ENV === 'production' ? [cssnano, purgecss] : []
    ]
}
