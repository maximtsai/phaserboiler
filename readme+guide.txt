Run instructions:
1. run runServer8124.exe to start a local server (needed otherwise you get security issues with the game)
2. Open up browser and type in localhost:8124
3. Game should load up and run

======

Files overview:
index.html - Where the code starts. localhost:8124 automatically runs it when you have local server running.
phaser.min.js - The phaser library.
main.js - base code that runs phaser and sets all the games' initial parameters like height and width
audioFiles.js - List of audio to load
fontFiles.js - List of fonts to load
imageFiles.js - List of images to load
textData1/2/3.js - I use these to store in-game text + translations
gameAnims.js - List of frame-by-frame sprite animations to set up

audio - All the audio files for the game
fonts - All the font files for the game
raw_assets - all the raw uncombined image files of the game. None of these will end up in the final built project. 
sprites - All the sprite image files for the game, combined into spritesheets
scripts - All of the game specific logic.

util - A bunch of functions I found useful in previous projects. No need to bother with most of it, but some commonly used items are:
1. messageBus.publish + messageBus.subscribe - An event system. 
You can call messageBus.publish("myString", param1) anywhere in the project and every messageBus.subscribe("myString", ...) will get activated.
ie. I want to pause the game and I've already set up a messageBus.subscribe("pauseGame", ...) inside timeManager.js, so I can call messageBus.publish("pauseGame") when I press some button and the game will pause.

2. new Button({...}) - A function that creates an in-game button. Use them like this:
(I suggest copying any existing in-game button as an example)
new Button({
        normal: {...}, // what button looks like normally
        hover: {...}, // what button looks like when hovered over
        press: {...}, // what button looks like when pressed down
        disable: {...}, // what button looks like when disabled and unclickable
        onMouseUp: () => {...} // logic that runs when you click on the button
    });

There are a ton of other functionalities with buttons all located in button.js. Button is probably a bit overengineered but I can do basically anything I want with these.