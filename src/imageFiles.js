const imageFilesPreload = [
    {name: 'whitePixel', src: 'sprites/preload/white_pixel.png'},
    {name: 'blackPixel', src: 'sprites/preload/black_pixel.png'},
];

const imageAtlases = [
    {name: 'pixels', src: 'sprites/pixels.json'},
    {name: 'ui', src: 'sprites/ui.json'},
    {name: 'buttons', src: 'sprites/buttons.json'},
    {name: 'backgrounds', src: 'sprites/backgrounds.json'},
    {name: 'icons', src: 'sprites/icons.json'},
];

const imageFiles = [
];

const videoFiles = [
];

Object.assign(window, {
    imageFilesPreload,
    imageAtlases,
    imageFiles,
    videoFiles,
});
