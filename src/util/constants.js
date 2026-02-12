// Game Constants - Centralized configuration for main.js and scripts/gameplaysetup.js
const CONSTANTS = {
    // Game dimensions
    MOBILE_WIDTH: 594,
    DESKTOP_WIDTH: 604,
    MOBILE_HEIGHT: 810,
    DESKTOP_HEIGHT: 775,
    
    // Game version
    GAME_VERSION: "v.1.0",
    
    // Time values
    TIME_UPDATE_MAX: 3,
    DELTA_TIME_BASE: 100,
    SMALL_TIMEOUT: 100,
    LARGE_TIMEOUT: 1000,
    
    // URL validation
    URL_SUBSTRING_LENGTH: 35,
    
    // Scale values
    BACKGROUND_SCALE: 1000,
    LOADING_BAR_WIDTH: 200,
    LOADING_BAR_HEIGHT: 3,
    
    // Screen shake durations
    SHAKE_DURATION_SHORT: 50,
    SHAKE_DURATION_LONG: 150,
    SHAKE_DURATION_EXTRA_LONG: 400,
    SHAKE_BOUNCE_PARAM: 3,
    
    // Zoom durations
    ZOOM_DURATION_FAST: 200,
    ZOOM_DURATION_SLOW_IN: 40,
    ZOOM_DURATION_SLOW_OUT: 300,
    
    // Border settings
    BORDER_WIDTH_FACTOR: 86,
    BORDER_SHIFT_OFFSET: 2,
    
    // Background animation durations (in seconds)
    BACKGROUND_FADE_DURATION: 1.5,
    BACKGROUND_FADE_DURATION_LONG: 3,
    BACKGROUND_SWITCH_DELAY: 1400,
    BACKGROUND_ANIMATION_FAST: 0.5,
    
    // Loading screen
    VERSION_PADDING_X: 4,
    LOADING_BAR_OFFSET_Y: 100,
    LOADING_TEXT_SCALE: 0.6,
    LOADING_TEXT_ALPHA: 0.93,
    LOADING_TEXT_MOBILE_Y: 342,
    LOADING_TEXT_DESKTOP_Y: 328,
    
    // Camera and animation
    CAMERA_TWEEN_DURATION: 750,
    TEXT_FADE_DURATION: 800,
    INTRO_GLOW_DELAY: 1500,
    INTRO_GLOW_ALPHA: 1.25,
    INTRO_GLOW_SCALE: 14,
    INTRO_GLOW_DURATION: 500,
    INTRO_WHITE_OVERLAY_ALPHA: 0.75,
    INTRO_WHITE_OVERLAY_DURATION: 2100,
    INTRO_TEMP_BG_ALPHA: 0.85,
    INTRO_TEMP_BG_DURATION: 750,
    SKIP_TEXT_OFFSET: 5,
    
    // Depth values
    SKIP_TEXT_DEPTH: 1005,
    WHITE_OVERLAY_DEPTH: 2000,
    TEMP_BG_DEPTH: 1002,
    LOADING_TEXT_DEPTH: 1001,
};

// Make constants available globally
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
}
