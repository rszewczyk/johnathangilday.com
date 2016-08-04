var Waffel = require('waffel'),
    filters = require('./lib/filters');

module.exports = function(port, path, callback) {
    wfl = new Waffel({
        domain:           'http://localhost:' + port,
        filters: filters,
        watch:            true,
        server:           true,
        serverConfig: {
            port:       port,
            path:       path,
            indexPath:  path + '/404.html'
        }
    });
    wfl.on('server:start', callback);
    wfl.init().then(wfl.generate);
};
