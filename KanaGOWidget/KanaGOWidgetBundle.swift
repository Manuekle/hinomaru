import SwiftUI
import WidgetKit

@main
struct KanaGOWidgetBundle: WidgetBundle {
    var body: some Widget {
        StreakWidget()
        WordWidget()
        TodayWidget()
    }
}
