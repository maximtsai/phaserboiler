// MainMenu - Handles all main menu UI elements
class MainMenu {
    constructor() {
        this.elements = {};
        this.isVisible = false;
    }

    // Create all main menu elements
    create() {

    }

    // Called when start button is clicked
    onStartClicked() {
    }

    // Destroy all main menu elements
    destroy() {
        for (let key in this.elements) {
            if (this.elements[key] && this.elements[key].destroy) {
                this.elements[key].destroy();
            }
        }
        this.elements = {};
        this.isVisible = false;
    }

    // Check if menu is currently visible
    isShowing() {
        return this.isVisible;
    }

    // This actually begins the game
    handleTrueStartLogic() {

    }
}

// Create global instance
const mainMenu = new MainMenu();
