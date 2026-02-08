// LoadingManager - Centralized loading with retry, stall detection, and error handling
// Handles both initial preload and main game loading phases

class LoadingManager {
    constructor() {
        this.MAX_RETRIES = 3;
        this.STALL_THRESHOLD = 20000; // 20 seconds without progress
        this.WATCHDOG_INTERVAL = 5000; // Check every 5 seconds
        this.TIMEOUT_THRESHOLD = 30000; // 30 second hard timeout for main loading
        this.RETRY_DELAY_BASE = 500; // Base delay for exponential backoff
    }

    // Main loading setup with full visual feedback and stall detection
    setupMainLoading(scene, onCompleteCallback, onProgressCallback = null) {
        let lastProgressTime = Date.now();
        let loadComplete = false;
        let loadTimeout = null;
        let failedFiles = new Map();

        const resetTimer = () => {
            lastProgressTime = Date.now();
        };

        // Progress tracking
        scene.load.on('progress', (value) => {
            resetTimer();
            if (onProgressCallback) {
                onProgressCallback(value);
            }
        });

        scene.load.on('fileprogress', resetTimer);

        // Retry logic for failed files
        scene.load.on('loaderror', (file) => {
            console.error('Failed to load file:', file.key, file.url);
            resetTimer();
            
            let retryCount = failedFiles.get(file.key) || 0;
            
            if (retryCount < this.MAX_RETRIES) {
                retryCount++;
                failedFiles.set(file.key, retryCount);
                console.warn(`Retrying ${file.key} (attempt ${retryCount}/${this.MAX_RETRIES})`);
                
                if (onProgressCallback) {
                    onProgressCallback(null, `retrying ${retryCount}/${this.MAX_RETRIES}`);
                }
                
                // Exponential backoff retry
                setTimeout(() => {
                    scene.load.retry();
                }, this.RETRY_DELAY_BASE * retryCount);
            } else {
                console.error(`Failed to load ${file.key} after ${this.MAX_RETRIES} attempts - will continue without it`);
                if (onProgressCallback) {
                    onProgressCallback(null, 'some files failed');
                }
            }
        });

        // Clear failed files on successful load
        scene.load.on('filecomplete', (key) => {
            resetTimer();
            if (failedFiles.has(key)) {
                console.log(`File ${key} loaded successfully on retry`);
                failedFiles.delete(key);
            }
        });

        // Hard timeout for main loading (30 seconds)
        loadTimeout = setTimeout(() => {
            if (!loadComplete) {
                console.warn(`Loading timeout reached - forcing game start with ${scene.load.totalFailed || 0} failed files`);
                this.finishLoading(scene, loadComplete, loadTimeout, null, onCompleteCallback);
            }
        }, this.TIMEOUT_THRESHOLD);

        // Watchdog for stall detection
        let watchdogInterval = setInterval(() => {
            if (loadComplete) {
                clearInterval(watchdogInterval);
                return;
            }
            
            let timeSinceProgress = Date.now() - lastProgressTime;
            if (timeSinceProgress > 10000) {
                console.warn(`Loading stalled for ${timeSinceProgress}ms`);
                if (!scene.load.isLoading()) {
                    console.warn('Loader inactive - forcing completion');
                    this.finishLoading(scene, loadComplete, loadTimeout, watchdogInterval, onCompleteCallback);
                }
            }
        }, this.WATCHDOG_INTERVAL);

        // Normal completion
        scene.load.on('complete', () => {
            if (!loadComplete) {
                this.finishLoading(scene, loadComplete, loadTimeout, watchdogInterval, onCompleteCallback);
            }
        });

        return {
            failedFiles,
            resetTimer
        };
    }

    // Initial preload setup - simpler, just stall detection and retry
    setupInitialPreload(scene, statusElement) {
        let lastProgressTime = Date.now();
        let loadStarted = false;
        let failedFiles = new Map();

        const resetTimer = () => {
            lastProgressTime = Date.now();
            loadStarted = true;
        };

        // Stall detection - reports stuck loading but doesn't timeout
        let stallCheckInterval = setInterval(() => {
            let timeSinceProgress = Date.now() - lastProgressTime;
            
            if (timeSinceProgress > this.STALL_THRESHOLD && !loadStarted) {
                console.error('Loading appears to be stuck - no progress for 20 seconds');
                if (statusElement) {
                    statusElement.innerHTML = "Loading appears stuck. Please check your connection and refresh.";
                    statusElement.style.color = '#ff6b6b';
                }
                clearInterval(stallCheckInterval);
            }
        }, this.WATCHDOG_INTERVAL);

        // Progress tracking
        scene.load.on('progress', resetTimer);
        scene.load.on('fileprogress', resetTimer);

        // Cleanup on completion
        scene.load.on('complete', () => {
            clearInterval(stallCheckInterval);
        });

        // Retry logic for initial preload
        scene.load.on('loaderror', (file) => {
            console.error('Initial preload error for file:', file.key);
            resetTimer();
            
            let retryCount = failedFiles.get(file.key) || 0;
            
            if (retryCount < this.MAX_RETRIES) {
                retryCount++;
                failedFiles.set(file.key, retryCount);
                console.warn(`Retrying ${file.key} (attempt ${retryCount}/${this.MAX_RETRIES})`);
                
                setTimeout(() => {
                    scene.load.retry();
                }, this.RETRY_DELAY_BASE * retryCount);
            } else {
                console.error(`Failed to load ${file.key} after ${this.MAX_RETRIES} attempts - will continue without it`);
            }
        });

        // Clear failed files on success
        scene.load.on('filecomplete', (key) => {
            if (failedFiles.has(key)) {
                console.log(`File ${key} loaded successfully on retry`);
                failedFiles.delete(key);
            }
        });

        return {
            failedFiles,
            resetTimer
        };
    }

    // Clean up and complete loading
    finishLoading(scene, loadCompleteRef, loadTimeout, watchdogInterval, onCompleteCallback) {
        loadCompleteRef = true;
        
        if (loadTimeout) {
            clearTimeout(loadTimeout);
        }
        if (watchdogInterval) {
            clearInterval(watchdogInterval);
        }
        
        if (scene.load.totalFailed > 0) {
            console.warn(`${scene.load.totalFailed} files failed to load - continuing anyway`);
        }
        
        if (onCompleteCallback) {
            onCompleteCallback();
        }
    }
}

// Create global instance
const loadingManager = new LoadingManager();
