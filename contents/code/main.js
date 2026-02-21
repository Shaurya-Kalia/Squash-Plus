/*
 *
 S PDX-FileCopyrig*htText:

 SPDX-License-Identifier: GPL-2.0-or-later
 */

"use strict";

var curveMapping = [
    // BASELINE
    QEasingCurve.Linear,

    // GENTLE (Sine)
    QEasingCurve.OutSine,
    QEasingCurve.InSine,
    QEasingCurve.InOutSine,

    // STANDARD (Quad, Cubic)
    QEasingCurve.OutQuad,
    QEasingCurve.InQuad,
    QEasingCurve.InOutQuad,
    QEasingCurve.OutCubic,
    QEasingCurve.InCubic,
    QEasingCurve.InOutCubic,

    // SHARP (Quart, Quint, Expo)
    QEasingCurve.OutQuart,
    QEasingCurve.InQuart,
    QEasingCurve.InOutQuart,
    QEasingCurve.OutQuint,
    QEasingCurve.InQuint,
    QEasingCurve.InOutQuint,
    QEasingCurve.OutExpo,
    QEasingCurve.InExpo,
    QEasingCurve.InOutExpo,

    // SUDDEN (Circ)
    QEasingCurve.OutCirc,
    QEasingCurve.InCirc,
    QEasingCurve.InOutCirc,

    // PHYSICS (Back)
    QEasingCurve.OutBack,
    QEasingCurve.InBack,
    QEasingCurve.InOutBack,

    // PHYSICS (Elastic)
    QEasingCurve.OutElastic,
    QEasingCurve.InElastic,
    QEasingCurve.InOutElastic,

    // PHYSICS (Bounce)
    QEasingCurve.OutBounce,
    QEasingCurve.InBounce,
    QEasingCurve.InOutBounce
];

var squashEffect = {
    duration: animationTime(250),
    opacity: 1.0,
    curveMin: QEasingCurve.OutExpo,
    curveUnmin: QEasingCurve.OutExpo,
    minimizeTarget: 0, // 0=TaskManager, 1=TopLeft, 2=Top, 3=TopRight, 4=Left, 5=Right, 6=BottomLeft, 7=Bottom, 8=BottomRight, 9=Mouse
    loadConfig: function () {
        squashEffect.duration = animationTime(effect.readConfig("Duration", 250));
        squashEffect.opacity = effect.readConfig("Opacity", 100) / 100.0;
        var minimizeTargetValue = effect.readConfig("MinimizeTarget", 0);

        // Normalize enum values to index.
        if (typeof minimizeTargetValue === "string") {
            var minimizeTargetMap = {
                TaskManager: 0,
                TopLeft: 1,
                Top: 2,
                TopRight: 3,
                Left: 4,
                Right: 5,
                BottomLeft: 6,
                Bottom: 7,
                BottomRight: 8,
                Mouse: 9
            };
            if (Object.prototype.hasOwnProperty.call(minimizeTargetMap, minimizeTargetValue)) {
                minimizeTargetValue = minimizeTargetMap[minimizeTargetValue];
            }
        }

        squashEffect.minimizeTarget = Number(minimizeTargetValue);
        if (squashEffect.minimizeTarget < 0 || squashEffect.minimizeTarget > 9) {
            squashEffect.minimizeTarget = 0;
        }

        var minIndex = effect.readConfig("AnimationCurveMinimize", 16);
        if (minIndex < 0 || minIndex >= curveMapping.length) minIndex = 16;
        squashEffect.curveMin = curveMapping[minIndex];

        var unminIndex = effect.readConfig("AnimationCurveUnminimize", 16);
        if (unminIndex < 0 || unminIndex >= curveMapping.length) unminIndex = 16;
        squashEffect.curveUnmin = curveMapping[unminIndex];
    },
    getScreenRect: function (window) {
        if (window && window.output && window.output.geometry) {
            return window.output.geometry;
        }

        if (window && window.screenGeometry) {
            return window.screenGeometry;
        }

        if (effects.virtualScreenGeometry) {
            return effects.virtualScreenGeometry;
        }

        return {
            x: 0,
            y: 0,
            width: effects.displayWidth,
            height: effects.displayHeight
        };
    },
    getTargetRect: function (window) {
        var screenRect = squashEffect.getScreenRect(window);
        var iconSize = 48; // Default icon size
        var targetRect = { x: 0, y: 0, width: iconSize, height: iconSize };

        switch (squashEffect.minimizeTarget) {
            case 0: // Task Manager
                var iconRect = window.iconGeometry;
                if (iconRect.width > 0 && iconRect.height > 0) {
                    return iconRect;
                }
                // Fallback to bottom if no icon geometry
                targetRect.x = screenRect.x + (screenRect.width - iconSize) / 2;
                targetRect.y = screenRect.y + screenRect.height - iconSize;
                break;
            case 1: // Top Left
                targetRect.x = screenRect.x;
                targetRect.y = screenRect.y;
                break;
            case 2: // Top
                targetRect.x = screenRect.x + (screenRect.width - iconSize) / 2;
                targetRect.y = screenRect.y;
                break;
            case 3: // Top Right
                targetRect.x = screenRect.x + screenRect.width - iconSize;
                targetRect.y = screenRect.y;
                break;
            case 4: // Left
                targetRect.x = screenRect.x;
                targetRect.y = screenRect.y + (screenRect.height - iconSize) / 2;
                break;
            case 5: // Right
                targetRect.x = screenRect.x + screenRect.width - iconSize;
                targetRect.y = screenRect.y + (screenRect.height - iconSize) / 2;
                break;
            case 6: // Bottom Left
                targetRect.x = screenRect.x;
                targetRect.y = screenRect.y + screenRect.height - iconSize;
                break;
            case 7: // Bottom
                targetRect.x = screenRect.x + (screenRect.width - iconSize) / 2;
                targetRect.y = screenRect.y + screenRect.height - iconSize;
                break;
            case 8: // Bottom Right
                targetRect.x = screenRect.x + screenRect.width - iconSize;
                targetRect.y = screenRect.y + screenRect.height - iconSize;
                break;
            case 9: // Mouse
                var cursorPos = effects.cursorPos;
                targetRect.x = cursorPos.x - iconSize / 2;
                targetRect.y = cursorPos.y - iconSize / 2;
                break;
        }

        return targetRect;
    },
    slotWindowMinimized: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }

        // Get the target rectangle based on minimize target setting
        var iconRect = squashEffect.getTargetRect(window);

        if (window.unminimizeAnimation) {
            if (redirect(window.unminimizeAnimation, Effect.Backward)) {
                return;
            }
            cancel(window.unminimizeAnimation);
            delete window.unminimizeAnimation;
        }

        if (window.minimizeAnimation) {
            if (redirect(window.minimizeAnimation, Effect.Forward)) {
                return;
            }
            cancel(window.minimizeAnimation);
        }

        var windowRect = window.geometry;

        window.setData(Effect.WindowForceBlurRole, true);

        window.minimizeAnimation = animate({
            window: window,
            curve: squashEffect.curveMin,
            duration: squashEffect.duration,
            animations: [
                {
                    type: Effect.Size,
                    from: {
                        value1: windowRect.width,
                        value2: windowRect.height
                    },
                    to: {
                        value1: iconRect.width,
                        value2: iconRect.height
                    }
                },
                {
                    type: Effect.Translation,
                    from: {
                        value1: 0.0,
                        value2: 0.0
                    },
                    to: {
                        value1: iconRect.x - windowRect.x - (windowRect.width - iconRect.width) / 2,
                        value2: iconRect.y - windowRect.y - (windowRect.height - iconRect.height) / 2
                    }
                },
                {
                    type: Effect.Opacity,
                    from: 1.0,
                    to: squashEffect.opacity
                }
            ]
        });
    },
    slotWindowUnminimized: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }

        // Get the target rectangle based on minimize target setting
        var iconRect = squashEffect.getTargetRect(window);

        if (window.minimizeAnimation) {
            if (redirect(window.minimizeAnimation, Effect.Backward)) {
                return;
            }
            cancel(window.minimizeAnimation);
            delete window.minimizeAnimation;
        }

        if (window.unminimizeAnimation) {
            if (redirect(window.unminimizeAnimation, Effect.Forward)) {
                return;
            }
            cancel(window.unminimizeAnimation);
        }

        var windowRect = window.geometry;

        window.unminimizeAnimation = animate({
            window: window,
            curve: squashEffect.curveUnmin,
            duration: squashEffect.duration,
            animations: [
                {
                    type: Effect.Size,
                    from: {
                        value1: iconRect.width,
                        value2: iconRect.height
                    },
                    to: {
                        value1: windowRect.width,
                        value2: windowRect.height
                    }
                },
                {
                    type: Effect.Translation,
                    from: {
                        value1: iconRect.x - windowRect.x - (windowRect.width - iconRect.width) / 2,
                        value2: iconRect.y - windowRect.y - (windowRect.height - iconRect.height) / 2
                    },
                    to: {
                        value1: 0.0,
                        value2: 0.0
                    }
                },
                {
                    type: Effect.Opacity,
                    from: squashEffect.opacity,
                    to: 1.0
                }
            ]
        });
    },
    slotWindowAdded: function (window) {
        window.minimizedChanged.connect(() => {
            if (window.minimized) {
                squashEffect.slotWindowMinimized(window);
            } else {
                squashEffect.slotWindowUnminimized(window);
            }
        });
    },
    init: function () {
        // Ensure saved settings are loaded on startup.
        squashEffect.loadConfig();
        effect.configChanged.connect(squashEffect.loadConfig);

        effects.windowAdded.connect(squashEffect.slotWindowAdded);
        for (const window of effects.stackingOrder) {
            squashEffect.slotWindowAdded(window);
        }
    }
};

squashEffect.init();
