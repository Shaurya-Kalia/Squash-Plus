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
    rotationAngle: 0.0,
    curveMin: QEasingCurve.OutExpo,
    curveUnmin: QEasingCurve.OutExpo,
    loadConfig: function () {
        squashEffect.duration = animationTime(effect.readConfig("Duration", 250));
        squashEffect.opacity = effect.readConfig("Opacity", 100) / 100.0;
        squashEffect.rotationAngle = effect.readConfig("RotationAngle", 0);

        var minIndex = effect.readConfig("AnimationCurveMinimize", 16);
        if (minIndex < 0 || minIndex >= curveMapping.length) minIndex = 16;
        squashEffect.curveMin = curveMapping[minIndex];

        var unminIndex = effect.readConfig("AnimationCurveUnminimize", 16);
        if (unminIndex < 0 || unminIndex >= curveMapping.length) unminIndex = 16;
        squashEffect.curveUnmin = curveMapping[unminIndex];
    },
    slotWindowMinimized: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }

        // If the window doesn't have an icon in the task manager,
        // don't animate it.
        var iconRect = window.iconGeometry;
        if (iconRect.width == 0 || iconRect.height == 0) {
            return;
        }

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
                },
                {
                    type: Effect.Rotation,
                    axis: 2,
                    from: 0.0,
                    to: squashEffect.rotationAngle
                }
            ]
        });
    },
    slotWindowUnminimized: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }

        // If the window doesn't have an icon in the task manager,
        // don't animate it.
        var iconRect = window.iconGeometry;
        if (iconRect.width == 0 || iconRect.height == 0) {
            return;
        }

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
                },
                {
                    type: Effect.Rotation,
                    axis: 2,
                    from: squashEffect.rotationAngle,
                    to: 0.0
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
        squashEffect.loadConfig();

        effect.configChanged.connect(squashEffect.loadConfig);

        effects.windowAdded.connect(squashEffect.slotWindowAdded);
        for (const window of effects.stackingOrder) {
            squashEffect.slotWindowAdded(window);
        }
    }
};

squashEffect.init();
