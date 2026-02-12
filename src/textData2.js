let textData2 = {

};

textData = { ...textData, ...textData2};

Object.assign(window, {
    textData2,
    textData,
});
