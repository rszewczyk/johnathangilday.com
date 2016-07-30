const indexhtml = /index\.html/;

module.exports = {
    attr: function(arr, attr) {
        return arr.map(function(i) { return i[attr]; });
    },
    noindexhtml: function(str) {
        return str.replace(indexhtml, '');
    }
};
