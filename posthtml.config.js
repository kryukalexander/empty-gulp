let locals = {
    locals: {
        title: 'Demo title',
        subtitle: 'Demo subtitle'
    }
};


module.exports = {
    plugins: [
        require('posthtml-include')({}),
        require('posthtml-expressions')(locals)
    ]
};