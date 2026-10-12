import SwiftUI

/// Duolingo-style winding path of lessons for one level.
struct RoadmapPath: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    var level: RoadmapLevel

    @State private var lockedTap = 0

    var body: some View {
        let current = app.currentLesson(in: level)
        VStack(alignment: .leading, spacing: 18) {
            levelHeader
            ForEach(Array(level.units.enumerated()), id: \.element.id) { index, unit in
                if index == 0 || level.units[index - 1].sectionEs != unit.sectionEs {
                    HStack(spacing: 10) {
                        Capsule().fill(KG.line).frame(height: 3)
                        Text(unit.section(app.lang).uppercased())
                            .kgFont(12, .bold).foregroundStyle(KG.muted)
                            .fixedSize()
                        Capsule().fill(KG.line).frame(height: 3)
                    }
                    .padding(.top, 6)
                }
                unitBlock(unit, current: current)
            }
        }
        .sensoryFeedback(.warning, trigger: lockedTap)
    }

    private var levelHeader: some View {
        let pct = app.levelProgress(level)
        return HStack(spacing: 14) {
            ZStack {
                Circle().stroke(KG.line, lineWidth: 8)
                Circle().trim(from: 0, to: pct)
                    .stroke(KG.mint, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text("\(Int(pct * 100))%").kgFont(13, .bold).foregroundStyle(KG.ink)
            }
            .frame(width: 56, height: 56)
            VStack(alignment: .leading, spacing: 2) {
                Text(app.t("Tu ruta", "Your path")).kgFont(13, .semibold).foregroundStyle(KG.muted)
                Text(app.t("\(level.units.count) unidades · \(level.lessons.count) lecciones",
                           "\(level.units.count) units · \(level.lessons.count) lessons"))
                    .kgFont(16, .bold).foregroundStyle(KG.ink)
            }
            Spacer()
        }
        .padding(14)
        .sticker(radius: 22)
    }

    private func unitBlock(_ unit: RoadmapUnit, current: RoadmapLesson?) -> some View {
        let done = unit.lessons.filter { app.lessonDone($0.id) }.count
        let color = unitColor(unit)
        return VStack(spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                Text(unit.emoji)
                    .font(.system(size: 30))
                    .frame(width: 54, height: 54)
                    .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(.white.opacity(0.25)))
                VStack(alignment: .leading, spacing: 3) {
                    // solid white or ink, whichever reads on the unit colour
                    Text(unit.title(app.lang)).kgFont(19, .bold).foregroundStyle(KG.on(color))
                    Text(unit.objective(app.lang)).kgFont(13, .semibold).foregroundStyle(KG.on(color))
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Text("\(done)/\(unit.lessons.count)")
                    .kgFont(13, .bold).foregroundStyle(KG.on(color) == .white ? color : KG.ink) // orange is too light on white
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(Capsule().fill(.white))
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(color))
            .shadow(color: color.opacity(0.35), radius: 12, y: 6)

            VStack(spacing: 14) {
                ForEach(Array(unit.lessons.enumerated()), id: \.element.id) { i, lesson in
                    node(lesson, index: i, isCurrent: lesson == current, color: color)
                        .offset(x: CGFloat(sin(Double(i) * .pi / 2.2)) * 72)
                        .id(lesson.id)
                }
            }
            .padding(.vertical, 6)
        }
    }

    private func unitColor(_ unit: RoadmapUnit) -> Color {
        let palette = [KG.pink, KG.sky, KG.mint, KG.grape, KG.flame, KG.ink]
        let index = level.units.firstIndex(of: unit) ?? 0
        return palette[index % palette.count]
    }

    @ViewBuilder
    private func node(_ lesson: RoadmapLesson, index: Int, isCurrent: Bool, color: Color) -> some View {
        let done = app.lessonDone(lesson.id)
        let unlocked = app.lessonUnlocked(lesson, in: level)
        let size: CGFloat = isCurrent ? 80 : 68
        let fill: Color = done ? KG.sun : unlocked ? color : Color(hex: 0xE3DFDA)
        let lip: Color = done ? KG.sunDeep : unlocked ? color.opacity(0.65) : Color(hex: 0xC9C4BE)

        Button {
            if unlocked {
                router.session = .lesson(id: lesson.id)
            } else {
                lockedTap += 1
            }
        } label: {
            ZStack {
                Circle().fill(lip).offset(y: 6)
                Circle().fill(fill)
                Circle().fill(.white.opacity(0.22)).frame(width: size * 0.62, height: size * 0.2).offset(y: -size * 0.26)
                HugeIcon(done ? .tick : unlocked ? lesson.icon : .lock, size: size * 0.4, filled: true)
                    .foregroundStyle(done ? .white : unlocked ? KG.on(fill) : KG.off)
            }
            .frame(width: size, height: size)
        }
        .buttonStyle(.squish)
        .overlay(alignment: .top) {
            if isCurrent {
                CurrentBubble(text: lesson.title(app.lang))
                    .offset(y: -50)
                    .allowsHitTesting(false)
            }
        }
        .overlay(alignment: index % 4 < 2 ? .trailing : .leading) {
            if isCurrent {
                KanaBlob(mood: .happy, size: 50)
                    .offset(x: index % 4 < 2 ? 76 : -76)
                    .allowsHitTesting(false)
            }
        }
        .padding(.top, isCurrent ? 44 : 0)
        .accessibilityLabel(lesson.title(app.lang))
    }
}

private struct CurrentBubble: View {
    @Environment(AppModel.self) private var app
    var text: String
    @State private var float = false

    var body: some View {
        VStack(spacing: 0) {
            Text(app.t("¡EMPIEZA!", "START!"))
                .kgFont(13, .bold)
                .foregroundStyle(KG.pinkText)
                .padding(.horizontal, 14).padding(.vertical, 7)
                .background(Capsule().fill(.white))
                .overlay(Capsule().strokeBorder(KG.line, lineWidth: 2))
            Rectangle()
                .fill(.white)
                .frame(width: 10, height: 10)
                .rotationEffect(.degrees(45))
                .offset(y: -6)
        }
        .fixedSize()
        .offset(y: float ? -4 : 2)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) { float = true }
        }
    }
}

struct LessonHost: View {
    @Environment(AppModel.self) private var app
    var lessonId: String

    var body: some View {
        if let ctx = app.content.lessonContext(lessonId) {
            LessonSession(level: ctx.level, unit: ctx.unit, lesson: ctx.lesson)
        }
    }
}
