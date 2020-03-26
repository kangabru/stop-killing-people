/*
* A tailwinds config file used to generate atomic utility css classes.
* See: https://tailwindcss.com/docs/configuration/
* Def: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*
* Run '$ npm run build:css' to compile changes in this file.
*/

module.exports = {
    theme: {
        extend: {
            colors: {
                "color-max": {
                    default: "hsl(203, 95%, 77%)",
                    light: "hsl(203, 95%, 90%)",
                },
                "color-min": {
                    default: "hsl(350, 100%, 79%)",
                    light: "hsl(350, 100%, 90%)",
                },
            },
        }
    }
}
