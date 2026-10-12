import SwiftUI
import WebKit

/// Drives an embedded YouTube IFrame player and mirrors its clock back to SwiftUI.
@Observable
final class YouTubeController {
    var time: Double = 0
    var isPlaying = false
    var ready = false
    var failed = false
    var rate: Double = 1
    /// Bumps every time the clip reaches its end.
    var endedCount = 0

    @ObservationIgnored fileprivate weak var webView: WKWebView?
    @ObservationIgnored private var stamp = Date()
    @ObservationIgnored private var shown: Double = 0

    func play() { run("player.playVideo()") }
    func pause() { run("player.pauseVideo()") }
    func toggle() { isPlaying ? pause() : play() }

    func seek(_ seconds: Double, play: Bool = true) {
        tick(seconds)
        // seekTo on a cued (never played) video starts playback, so pause explicitly
        run("player.seekTo(\(seconds), true)" + (play ? ";player.playVideo()" : ";player.pauseVideo()"))
    }

    func setRate(_ r: Double) {
        rate = r
        run("player.setPlaybackRate(\(r))")
    }

    fileprivate func tick(_ t: Double) {
        time = t
        stamp = .now
    }

    /// Clip time between the page's 200 ms clock ticks, so lyric fills glide instead of stepping.
    func smoothTime(at date: Date) -> Double {
        var t = time
        if isPlaying { t += min(date.timeIntervalSince(stamp), 0.5) * rate }
        // a fresh tick can land a hair behind the estimate; don't let the fill twitch backwards
        if t < shown, shown - t < 0.3 { return shown }
        shown = t
        return t
    }

    private func run(_ js: String) {
        webView?.evaluateJavaScript("try{\(js)}catch(e){}", completionHandler: nil)
    }
}

struct YouTubePlayerView: UIViewRepresentable {
    let videoId: String
    let start: Double
    let end: Double
    let controller: YouTubeController

    func makeCoordinator() -> Coordinator { Coordinator(controller) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.add(context.coordinator, name: "yt")

        let web = WKWebView(frame: .zero, configuration: config)
        web.isOpaque = false
        web.backgroundColor = .black
        web.scrollView.isScrollEnabled = false
        web.navigationDelegate = context.coordinator
        controller.webView = web
        // A real https base URL gives the embed a referrer/origin, which YouTube requires.
        web.loadHTMLString(html, baseURL: URL(string: "https://kanago.app/"))
        context.coordinator.armTimeout()
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "yt")
        uiView.evaluateJavaScript("try{player.stopVideo()}catch(e){}", completionHandler: nil)
    }

    private var html: String {
        """
        <!doctype html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
        <style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#p{position:absolute;inset:0;width:100%;height:100%}</style>
        </head><body><div id="p"></div>
        <script>
        var player;
        function post(m){window.webkit.messageHandlers.yt.postMessage(m)}
        function onYouTubeIframeAPIReady(){
          player = new YT.Player('p', {
            videoId: '\(videoId)',
            playerVars: {playsinline:1, start:\(Int(start)), end:\(Int(end.rounded(.up))), controls:0, rel:0,
                         modestbranding:1, iv_load_policy:3, disablekb:1, fs:0, origin:'https://kanago.app'},
            events: {
              onReady: function(){ post({e:'ready'}) },
              onStateChange: function(ev){ post({e:'state', s:ev.data}) },
              onError: function(ev){ post({e:'error', c:ev.data}) }
            }
          });
          setInterval(function(){
            if (player && player.getCurrentTime) post({e:'time', t:player.getCurrentTime()})
          }, 200);
        }
        </script>
        <script src="https://www.youtube.com/iframe_api" onerror="post({e:'error',c:-1})"></script>
        </body></html>
        """
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        let controller: YouTubeController

        init(_ controller: YouTubeController) { self.controller = controller }

        func armTimeout() {
            DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
                guard let self, !self.controller.ready else { return }
                self.controller.failed = true
            }
        }

        func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let event = body["e"] as? String else { return }
            switch event {
            case "ready":
                controller.ready = true
                controller.failed = false
            case "time":
                if let t = body["t"] as? Double { controller.tick(t) }
            case "state":
                // 1 = playing, 2 = paused, 0 = ended
                let s = body["s"] as? Int ?? -1
                controller.isPlaying = s == 1
                if s == 0 { controller.endedCount += 1 }
            case "error":
                controller.failed = true
            default:
                break
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            controller.failed = true
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            controller.failed = true
        }

        // Keep taps on the YouTube logo etc. from navigating the embedded view away.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if action.navigationType == .linkActivated {
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        }
    }
}
