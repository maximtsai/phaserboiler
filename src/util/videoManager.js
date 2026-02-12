// VideoManager - Simple video handling with pre-known dimensions
// Assumes all videos are the same aspect ratio (768 height base)

class VideoManager {
    constructor() {
        this.activeVideos = [];
        this.loadingIndicators = new Map(); // Track loading indicators by key
    }

    // Check if a video is loaded and ready
    isVideoLoaded(scene, key) {
        return scene.cache.video.has(key);
    }

    // Play a video with loading check and fallback
    // If video isn't loaded, shows spinning loading icon instead
    async playVideoWithFallback(scene, key, x, y, startScale = 1, atlasKey = 'ui', loadingIconKey = 'loading_icon.png') {
        // Check if video is already loaded
        if (this.isVideoLoaded(scene, key)) {
            // Video is ready, play it normally
            return this.playVideo(scene, key, x, y, startScale);
        }

        // Video not loaded yet, show loading indicator
        console.log(`Video ${key} not loaded yet, showing loading indicator`);

        const loadingIndicator = scene.add.image(x, y, atlasKey, loadingIconKey).setDepth(100);
        loadingIndicator.setScale(startScale * 0.5); // Make it smaller than the video

        // Spin at 2 full rotations per second (720 degrees per second)
        // One full rotation = 360 degrees, so 2 rotations = 720 degrees per second
        // Duration for one full rotation = 1000ms / 2 = 500ms
        scene.tweens.add({
            targets: loadingIndicator,
            angle: 360,
            duration: 500, // 2 rotations per second = 500ms per rotation
            repeat: -1, // Infinite repeat
            ease: 'Linear'
        });

        // Store the loading indicator
        this.loadingIndicators.set(key, {
            indicator: loadingIndicator,
            scene: scene,
            x: x,
            y: y,
            startScale: startScale
        });

        // Listen for when this specific video finishes loading
        const onVideoLoaded = (loadedKey) => {
            if (loadedKey === key) {
                console.log(`Video ${key} loaded, swapping loading indicator for video`);

                // Get the loading indicator info
                const loadingInfo = this.loadingIndicators.get(key);
                if (loadingInfo) {
                    // Fade out loading indicator
                    scene.tweens.add({
                        targets: loadingInfo.indicator,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            loadingInfo.indicator.destroy();
                        }
                    });

                    // Remove from tracking
                    this.loadingIndicators.delete(key);
                }

                // Play the video
                const video = this.playVideo(scene, key, x, y, startScale);
                video.setLoop(true);
                video.setAlpha(0);
                video.play();

                // Fade in the video
                scene.tweens.add({
                    targets: video,
                    alpha: 1,
                    duration: 300
                });

                // Remove the listener
                scene.load.off('filecomplete-video-' + key, onVideoLoaded);
            }
        };

        // Listen for this specific video to load
        scene.load.on('filecomplete-video-' + key, onVideoLoaded);

        // Return a placeholder that gets replaced when video loads
        return {
            isLoadingIndicator: true,
            key: key,
            destroy: () => {
                const loadingInfo = this.loadingIndicators.get(key);
                if (loadingInfo) {
                    loadingInfo.indicator.destroy();
                    this.loadingIndicators.delete(key);
                }
                scene.load.off('filecomplete-video-' + key, onVideoLoaded);
            }
        };
    }

    // Start loading delayed videos in background
    loadDelayedVideos(scene) {
        if (typeof videoFilesDelayed === 'undefined' || !videoFilesDelayed.length) {
            console.log('No delayed videos to load');
            return;
        }

        console.log('Starting background load of delayed videos...');

        videoFilesDelayed.forEach(videoData => {
            scene.load.video(videoData.name, videoData.src);
        });

        // Start loading in background (non-blocking)
        scene.load.start();
    }

    // Common video setup logic used by both playVideo and loadVideo
    _setupVideo(scene, key, x, y, startScale = 1, depth = 1, loop = false, onComplete = null) {
        const video = scene.add.video(x, y, key);

        video.setScale(startScale);
        video.setDepth(depth);
        video.setVisible(true);
        video.setLoop(loop);

        // Add onComplete listener if provided (only works if loop is false)
        if (onComplete && !loop) {
            video.on('complete', onComplete);
        }

        // Update with actual dimensions when metadata loads
        video.on('created', () => {
            const videoElement = video.video;
            if (videoElement && videoElement.videoWidth > 0) {
                // Update actual dimensions
                video.width = videoElement.videoWidth;
                video.height = videoElement.videoHeight;

                // Recalculate display size with actual proportions
                const actualScale = startScale * (768 / video.height);
                // video.setDisplaySize(video.width * actualScale, video.height * actualScale);
            }
        });

        this.activeVideos.push(video);
        return video;
    }

    // Load a video at specific position with initial scale (does NOT play)
    // Same as playVideo but without calling video.play()
    loadVideo(scene, key, x, y, startScale = 1, depth = 1, loop = false, onComplete = null) {
        return this._setupVideo(scene, key, x, y, startScale, depth, loop, onComplete);
    }

    // Play a video at specific position with initial scale
    // startScale should be calculated as gameHeight / 768 for proper sizing
    // onComplete callback runs when video finishes playing (only if loop is false)
    playVideo(scene, key, x, y, startScale = 1, depth = 1, loop = false, onComplete = null) {
        const video = this._setupVideo(scene, key, x, y, startScale, depth, loop, onComplete);

        // Actually play the video!
        video.play();

        return video;
    }

    // Listen for video completion
    // Returns a function that can be called to remove the listener
    onVideoComplete(video, callback) {
        if (!video) return () => {};

        video.on('complete', callback);

        // Return unsubscribe function
        return () => {
            video.off('complete', callback);
        };
    }

    // Play a one-shot video, then when it finishes, play a looping video
    // firstKey: the one-shot video to play first
    // thenKey: the looping video to play after
    // useFullSize: if true, plays at scale 1 (for 632px height videos), otherwise uses startScale
    playThenLoop(scene, firstKey, thenKey, x, y, startScale, depth = 1) {
        // Determine actual scale - use 1 for full-size videos, otherwise use provided scale

        // Play the first video (non-looping)
        const firstVideo = this.playVideo(scene, firstKey, x, y, startScale, depth, false, () => {
            // When first video finishes, destroy it and play the looping video
            this.swapVideo(scene, firstVideo, thenKey, firstVideo.x, firstVideo.y, startScale, depth)
        });

        // Return the first video (second video is already tracked in activeVideos)
        return firstVideo;
    }

    // Stop and remove a video
    stopVideo(video) {
        if (!video) return;

        video.stop();
        const index = this.activeVideos.indexOf(video);
        if (index > -1) {
            this.activeVideos.splice(index, 1);
        }
    }

    // Destroy video completely
    destroyVideo(video) {
        if (!video) return;

        this.stopVideo(video);
        video.destroy();
    }

    // Swap videos with crossfade (optional)
    swapVideo(scene, currentVideo, newKey, x, y, startScale, crossfade = false, fadeDuration = 100) {
        // Check if new video is loaded
        if (!this.isVideoLoaded(scene, newKey)) {
            console.warn(`Video ${newKey} not loaded yet, attempting to play with fallback`);
            return this.playVideoWithFallback(scene, newKey, x, y, startScale);
        }

        if (crossfade && currentVideo) {
            // Fade out current while fading in new
            const newVideo = this.playVideo(scene, newKey, x, y, startScale);
            newVideo.setDepth(1);
            newVideo.setAlpha(0);
            newVideo.setLoop(true);
            newVideo.play();

            scene.tweens.add({
                targets: newVideo,
                alpha: 1,
                duration: fadeDuration,
                onComplete: () => {
                    this.destroyVideo(currentVideo);
                }
            });

            return newVideo;
        } else {
            // Immediate swap
            if (currentVideo) {
                this.destroyVideo(currentVideo);
            }

            const newVideo = this.playVideo(scene, newKey, x, y, startScale);
            newVideo.setLoop(true);
            newVideo.play();
            return newVideo;
        }
    }

    // Clean up all loading indicators
    cleanupLoadingIndicators() {
        this.loadingIndicators.forEach((loadingInfo, key) => {
            if (loadingInfo.indicator) {
                loadingInfo.indicator.destroy();
            }
        });
        this.loadingIndicators.clear();
    }

    // Stop all videos
    stopAll() {
        while (this.activeVideos.length > 0) {
            this.stopVideo(this.activeVideos[0]);
        }
        this.cleanupLoadingIndicators();
    }
}

// Create global instance
const videoManager = new VideoManager();
