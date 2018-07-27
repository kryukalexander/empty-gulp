module.exports = {
    plugins: {
        'postcss-import': {},
        'autoprefixer': {},
        'postcss-flexbugs-fixes' : {},
        'postcss-assets': {},
        'postcss-at2x' : {},
        'postcss-sprites': {
            retina: true,
            spritePath: 'src/images/',
            spritesmith: { padding: 10 },
            filterBy: (image) => {
                if (!/\/images-sprite\//.test(image.url)) {
                    return Promise.reject();
                }
                return Promise.resolve();
            }
        },
        'cssnano' : {}
    }
};
