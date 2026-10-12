# iOS Splash Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved plan in the current session. The user already authorized the native implementation.

**Goal:** Replace the uneven splash with one restrained sequence, preserving the artwork and making the launch handoff continuous.

**Architecture:** Keep LaunchGate as the SwiftUI boundary. Host a private UIKit controller whose prepared image layers animate with Core Animation after appearance. Notify SwiftUI exactly once when the exit finishes, then warm up app services.

**Tech Stack:** SwiftUI, UIKit, Core Animation, iOS 17 or later.

**Spec:** ../specs/2026-10-12-ios-splash-design.md

## Global Constraints

- Background: LaunchBackground (#DE2B62).
- First frame: original LaunchMascot at 170 × 160 points, centered.
- One approximately 900 ms sequence; 12-point movement; 240 ms exit.
- No nonuniform scale, spring, rotation, ripple, animated mask, or root-content scale.
- Reduced motion: stationary mascot and a short opacity fade.
- Preserve navigation, content, progress, deep links, and brand assets.
- This workspace has no Git repository. Save the plan and changes without initializing one or making commits.

## Task 1: Native splash and launch scheduling

**Files:** Modify KanaGO/Features/SplashView.swift and KanaGO/App/KanaGOApp.swift.

**Interfaces:** LaunchGate(onFinished:content:) hosts the app and invokes its completion once. A private UIViewControllerRepresentable passes reduced-motion state and completion into a private splash controller.

- [ ] Replace the repeating keyframe view with the native controller. Keep content stable and inaccessible until completion; remove the splash without an additional SwiftUI transition.
- [ ] Prepare raster-backed UIImage instances at the current display scale during layout. Set fixed image bounds and center positions matching the system launch screen.
- [ ] Start from viewDidAppear and a two-tick CADisplayLink. A single hasStarted flag prevents replay. Cancel the display link and layer animations when the representable is dismantled.
- [ ] Schedule opacity and translation animations with explicit start times and backwards fill. Set final model-layer values in a transaction with implicit actions disabled:

```swift
mascot.layer.transform = CATransform3DMakeTranslation(0, -12, 0)
wordmark.layer.opacity = 1
view.layer.opacity = 0
```

- [ ] Use CAAnimationDelegate on the exit animation to deliver completion exactly once. Use no movement or logo entrance when reduced motion is enabled; if enabled during the sequence, replace it with a stationary fade.
- [ ] Move startup preparation into the LaunchGate completion and perform sound precaching in a main-actor task after the splash has finished.

## Task 2: Cooperative sound warmup

**File:** Modify KanaGO/Data/Stores.swift.

**Interface:** SoundPlayer.preload() becomes an async main-actor function. Existing play() and pool() behavior remain intact.

- [ ] Skip warmup when sound is disabled. Prepare one sound pool at a time and yield between pools:

```swift
@MainActor
func preload() async {
    guard enabled else { return }
    for sound in SFX.allCases {
        guard !Task.isCancelled else { return }
        _ = pool(sound)
        await Task.yield()
    }
}
```

## Task 3: Build and visual verification

- [ ] Build with `xcodebuild -project KanaGO.xcodeproj -scheme KanaGO -configuration Debug -destination 'platform=iOS Simulator,id=3E54560F-5CB2-4868-8B15-B01C4498C250' -derivedDataPath build build` and inspect diagnostics.
- [ ] Install over the existing simulator app. Record a cold launch and a second launch. Extract frames to verify the static handoff, stable proportions, logo entrance, and completed fade.
- [ ] Enable the simulator's ReduceMotionEnabled preference, reboot it, and record another launch. Verify the mascot stays stationary and the app appears. Restore the original setting afterward.
- [ ] Confirm the app remains functional and that returning from the background does not replay the splash. Save a reviewable video and report the limits of simulator validation.
