var Waffel = require('waffel'),
    filters = require('./lib/filters');

function waffelinit(generatedFiles) {
    wfl = new Waffel({
        domain: 'https://johnathangilday.com',
        filters: filters
    });
    wfl.init().then(wfl.generate);
}

module.exports = {
    npm: {
        styles: { 'normalize.css': ['normalize.css'] }
    },
    files: {
        javascripts: { 
            joinTo: 'main.js' 
        },
        stylesheets: { 
            joinTo: {
                'css/vendor.css': /^node_modules/,
                'css/main.css': /^app\/styles\/main\//,
                'css/resume.css': /^app\/styles\/resume\//
            }
        }
    },
    overrides: {
        production: {
            sourceMaps: false,
            plugins: {
                autoReload: { enabled: false }
            },
            hooks: {
                onCompile: waffelinit
            }
        }
    }
};
