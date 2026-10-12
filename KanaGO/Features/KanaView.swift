import SwiftUI

struct KanaView: View {
    @Environment(AppModel.self) private var app
    @State private var script: Script = .hiragana
    @State private var query = ""
    @State private var selected: KanaChar?

    private var q: String { query.trimmingCharacters(in: .whitespaces).lowercased() }

    var body: some View {
        NavigationStack {
            ZStack {
                KGBackground()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(app.t("Descifra el kana", "Decode kana"))
                                .kgFont(30, .bold).foregroundStyle(KG.ink)
                            Text(app.t("con una tabla de sonidos", "with a sound grid"))
                                .kgFont(17, .semibold).foregroundStyle(KG.pinkText)
                        }
                        .padding(.top, 8)

                        ScriptPicker(script: $script)
                        searchField
                        NavigationLink {
                            KanaQuizSetupView(script: script)
                        } label: {
                            HStack(spacing: 14) {
                                KanaBlob(mood: .wow, size: 54, animated: false)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(app.t("Quiz de \(script.latin)", "\(script.latin) quiz"))
                                        .kgFont(18, .bold).foregroundStyle(.white)
                                    Text(app.t("Elige filas y ponte a prueba", "Pick rows and test yourself"))
                                        .kgText(13, .medium).foregroundStyle(.white.opacity(0.75))
                                }
                                Spacer()
                                // white arrow: the solid icon's cut-out shows the white disc beneath;
                                // white on pink is 3.7:1, above the 3:1 icon bar
                                HugeIcon(.arrowRightCircle, size: 30, filled: true)
                                    .foregroundStyle(KG.pink)
                                    .background(Circle().fill(.white).padding(6))
                            }
                            .padding(14)
                            .background(quizCardBackground)
                        }
                        .buttonStyle(.squish)

                        ForEach(app.content.sections(script)) { section in
                            sectionGrid(section)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
                .scrollDismissesKeyboard(.immediately)
            }
            .toolbar(.hidden, for: .navigationBar)
            .sheet(item: $selected) { c in
                KanaDetailSheet(char: c)
                    .presentationDetents([.large])
                    .presentationCornerRadius(32)
            }
        }
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            HugeIcon(.search, size: 20).foregroundStyle(KG.ink)
            TextField(app.t("Busca por romaji… ej. ka", "Search by romaji… e.g. ka"), text: $query)
                .kgFont(18, .semibold)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            if !query.isEmpty {
                Button { query = "" } label: {
                    HugeIcon(.cancelCircle, size: 20).foregroundStyle(KG.muted)
                }
            }
            Image("logo.go")
                .resizable()
                .scaledToFit()
                .frame(height: 30)
                .rotationEffect(.degrees(-4))
                // the sticker's white die-cut edge needs a lift to read on the white field
                .shadow(color: KG.ink.opacity(0.14), radius: 3, y: 1)
                .accessibilityHidden(true)
        }
        .padding(.horizontal, 16)
        .frame(height: 54)
        .sticker(radius: 27, border: KG.pinkSoft, lineWidth: 3)
    }

    /// Ink card with a pink glow behind the mascot — her dark body sinks into plain ink.
    /// Solid pink out to her edge (r≈32), down to 35% where the text starts (r≈47) —
    /// subtitle stays ≥ 4.5:1 there — and gone by r=64.
    private var quizCardBackground: some View {
        let shape = RoundedRectangle(cornerRadius: 24, style: .continuous)
        return shape
            .fill(KG.ink)
            .overlay(alignment: .leading) {
                RadialGradient(
                    stops: [
                        .init(color: KG.candy, location: 0),
                        .init(color: KG.candy.opacity(0.95), location: 0.5),
                        .init(color: KG.candy.opacity(0.35), location: 0.73),
                        .init(color: KG.candy.opacity(0), location: 1),
                    ],
                    center: .center, startRadius: 0, endRadius: 64
                )
                .frame(width: 128, height: 128)
                .offset(x: 14 + 32 - 64) // centred on the 54pt blob (64.8pt wide) after 14pt padding
            }
            .clipShape(shape)
            .shadow(color: KG.ink.opacity(0.07), radius: 14, x: 0, y: 8)
    }

    private func columns(for section: KanaSection) -> Int {
        section.id.contains("yoon") ? 3 : section.id.contains("special") ? 2 : 5
    }

    private func slot(_ c: KanaChar, cols: Int) -> Int? {
        guard let last = c.romaji.last else { return nil }
        if cols == 5 { return ["a": 0, "i": 1, "u": 2, "e": 3, "o": 4][String(last)] }
        if cols == 3 { return ["a": 0, "u": 1, "o": 2][String(last)] }
        return nil
    }

    private func rowCells(_ group: KanaGroup, cols: Int) -> [KanaChar?] {
        var cells = [KanaChar?](repeating: nil, count: cols)
        var overflow: [KanaChar] = []
        for c in group.chars {
            if let s = slot(c, cols: cols), cells[s] == nil { cells[s] = c } else { overflow.append(c) }
        }
        for c in overflow {
            if let free = cells.firstIndex(where: { $0 == nil }) { cells[free] = c } else { cells.append(c) }
        }
        return cells
    }

    @ViewBuilder
    private func sectionGrid(_ section: KanaSection) -> some View {
        let cols = columns(for: section)
        let vowels = cols == 5 ? ["a", "i", "u", "e", "o"] : cols == 3 ? ["ya", "yu", "yo"] : []
        VStack(alignment: .leading, spacing: 10) {
            SectionTitle(section.title(app.lang).replacingOccurrences(of: "\(script.latin) — ", with: ""))
            Grid(horizontalSpacing: 7, verticalSpacing: 7) {
                if !vowels.isEmpty {
                    GridRow {
                        Text("").frame(width: 26)
                        ForEach(vowels, id: \.self) { v in
                            Text(v).kgFont(12, .bold).foregroundStyle(KG.muted)
                        }
                    }
                }
                ForEach(section.groups) { group in
                    GridRow {
                        Text(group.title(app.lang).count <= 3 ? group.title(app.lang) : "")
                            .kgFont(12, .bold)
                            .foregroundStyle(KG.muted)
                            .frame(width: 26)
                        ForEach(Array(rowCells(group, cols: cols).enumerated()), id: \.offset) { _, cell in
                            if let cell {
                                KanaCell(char: cell, highlighted: !q.isEmpty && cell.romaji.hasPrefix(q),
                                         dimmed: !q.isEmpty && !cell.romaji.hasPrefix(q),
                                         mastery: app.p.kanaSeen[cell.id] ?? 0) {
                                    selected = cell
                                }
                            } else {
                                Color.clear.frame(height: 62)
                            }
                        }
                    }
                }
            }
            .padding(12)
            .sticker(radius: 26)
        }
    }
}

struct ScriptPicker: View {
    @Binding var script: Script
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 4) {
            ForEach(Script.allCases) { s in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) { script = s }
                } label: {
                    VStack(spacing: 0) {
                        Text(s.label).kgFont(17, .bold)
                        Text(s.latin).kgFont(11, .semibold).opacity(script == s ? 1 : 0.7) // 70% white on pink is < 3:1
                    }
                    .foregroundStyle(script == s ? .white : KG.inkSoft)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background {
                        if script == s {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(s == .hiragana ? KG.pink : KG.ink)
                                .matchedGeometryEffect(id: "pill", in: ns)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(5)
        .sticker(radius: 23)
        .sensoryFeedback(.selection, trigger: script)
    }
}

struct KanaCell: View {
    var char: KanaChar
    var highlighted = false
    var dimmed = false
    var mastery = 0
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 0) {
                Text(char.jp)
                    .font(.system(size: char.jp.count > 1 ? 20 : 26, weight: .semibold, design: .rounded))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                Text(char.romaji)
                    .kgFont(10, .semibold)
                    .foregroundStyle(highlighted ? .white : KG.muted)
            }
            .foregroundStyle(highlighted ? .white : KG.ink)
            .frame(maxWidth: .infinity)
            .frame(height: 62)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(highlighted ? KG.pink : (mastery >= 3 ? KG.pinkSoft : KG.cream))
            )
            .overlay(alignment: .topTrailing) {
                if mastery >= 3 && !highlighted {
                    Circle().fill(KG.pink).frame(width: 6, height: 6).padding(6)
                }
            }
            .opacity(dimmed ? 0.3 : 1)
            .scaleEffect(highlighted ? 1.06 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: highlighted)
        }
        .buttonStyle(.squish)
        .accessibilityLabel("\(char.jp), \(char.romaji)")
    }
}

// MARK: - Detail

struct KanaDetailSheet: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var char: KanaChar
    @State private var pad: WritingPad

    init(char: KanaChar) {
        self.char = char
        _pad = State(initialValue: WritingPad(text: char.jp, mode: .trace))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                HStack {
                    Pill(text: char.script == "hiragana" ? "ひらがな" : "カタカナ",
                         color: char.script == "hiragana" ? KG.pink : KG.ink)
                    Spacer()
                    Button { dismiss() } label: {
                        HugeIcon(.cancel, size: 20).foregroundStyle(KG.muted)
                            .frame(width: 36, height: 36).background(Circle().fill(KG.cream))
                    }
                }

                VStack(spacing: 6) {
                    Text(char.jp)
                        .font(.system(size: 120, weight: .semibold, design: .rounded))
                        .foregroundStyle(KG.ink)
                    HStack(spacing: 10) {
                        Text("romaji · “\(char.romaji)”").kgFont(18, .semibold).foregroundStyle(KG.inkSoft)
                        SpeakButton(text: char.jp)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
                .sticker(radius: 30)

                VStack(alignment: .leading, spacing: 10) {
                    SectionTitle(app.t("Practica el trazo", "Practice writing"), jp: "かいて")
                    TraceCanvas(pad: pad)
                    if pad.glyph != nil {
                        Text(pad.message(app) ?? app.t("Empieza en el punto rosa", "Start at the pink dot"))
                            .kgFont(15, .semibold)
                            .foregroundStyle(pad.complete ? KG.mintDeep : KG.inkSoft)
                            .frame(maxWidth: .infinity)
                    }
                }

                let words = app.content.words(for: char)
                if !words.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        SectionTitle(app.t("Palabras", "Words"), jp: "ことば")
                        ForEach(words, id: \.jp) { w in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(w.jp).kgFont(24, .semibold).foregroundStyle(KG.ink)
                                    Text(app.p.showRomaji ? "\(w.romaji) · \(w.meaning(app.lang))" : w.meaning(app.lang))
                                        .kgText(14, .medium).foregroundStyle(KG.muted)
                                }
                                Spacer()
                                SpeakButton(text: w.jp)
                            }
                            .padding(14)
                            .sticker(radius: 20)
                        }
                    }
                }
            }
            .padding(20)
        }
        .background(KG.cream.ignoresSafeArea())
        .onAppear { Speaker.shared.speak(char.jp, rate: app.p.speechRate) }
    }
}

struct SpeakButton: View {
    @Environment(AppModel.self) private var app
    var text: String
    var size: CGFloat = 40
    @State private var tick = 0

    var body: some View {
        Button {
            tick += 1
            Speaker.shared.speak(text, rate: app.p.speechRate)
        } label: {
            HugeIcon(.volume, size: size * 0.46)
                .keyframeAnimator(initialValue: 1.0, trigger: tick) { v, s in v.scaleEffect(s) } keyframes: { _ in
                    SpringKeyframe(1.2, duration: 0.12)
                    SpringKeyframe(1.0, duration: 0.25)
                }
                .foregroundStyle(.white)
                .frame(width: size, height: size)
                .background(Circle().fill(KG.pink))
        }
        .buttonStyle(.squish)
        .accessibilityLabel(app.t("Escuchar", "Listen"))
    }
}

// MARK: - Quiz setup

struct KanaQuizSetupView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    @State var script: Script
    @State private var picked: Set<String> = []

    var body: some View {
        ZStack(alignment: .bottom) {
            KGBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    MascotSays(mood: .curious, text: app.t("¿Qué filas practicamos hoy?", "Which rows shall we practice?"))
                    ScriptPicker(script: $script)
                        .onChange(of: script) { picked = [] }
                    ForEach(app.content.sections(script)) { section in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(section.title(app.lang).replacingOccurrences(of: "\(script.latin) — ", with: ""))
                                    .kgFont(17, .bold).foregroundStyle(KG.ink)
                                Spacer()
                                Button(app.t("Todas", "All")) {
                                    let ids = Set(section.groups.map(\.id))
                                    if ids.isSubset(of: picked) { picked.subtract(ids) } else { picked.formUnion(ids) }
                                }
                                .kgFont(13, .bold)
                                .foregroundStyle(KG.pinkText)
                            }
                            FlowLayout(spacing: 8) {
                                ForEach(section.groups) { g in
                                    let on = picked.contains(g.id)
                                    Button {
                                        if on { picked.remove(g.id) } else { picked.insert(g.id) }
                                    } label: {
                                        Text(g.chars.prefix(3).map(\.jp).joined(separator: " "))
                                            .kgFont(16, .semibold)
                                            .foregroundStyle(on ? .white : KG.ink)
                                            .padding(.horizontal, 14).padding(.vertical, 10)
                                            .background(Capsule().fill(on ? KG.pink : .white))
                                            .shadow(color: KG.ink.opacity(0.06), radius: 6, y: 3)
                                    }
                                    .buttonStyle(.squish)
                                }
                            }
                        }
                    }
                }
                .padding(20)
                .padding(.bottom, 100)
            }
            Button {
                router.session = .kanaQuiz(script: script, groupIds: Array(picked).sorted())
            } label: {
                Text(picked.isEmpty ? app.t("Elige al menos una fila", "Pick at least one row") : app.t("¡Empezar quiz!", "Start quiz!"))
            }
            .buttonStyle(.chunky)
            .disabled(picked.isEmpty)
            .opacity(picked.isEmpty ? 0.5 : 1)
            .padding(.horizontal, 20)
            .padding(.bottom, 10)
        }
        .navigationTitle(app.t("Quiz de kana", "Kana quiz"))
        .toolbar(.hidden, for: .tabBar) // the floating start button takes its place
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if picked.isEmpty, let first = app.content.sections(script).first {
                picked = Set(first.groups.prefix(2).map(\.id))
            }
        }
    }
}

/// Simple wrapping layout for chips.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    /// Gap between rows; `spacing` when nil.
    var lineSpacing: CGFloat? = nil

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxW = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0, widest: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > maxW, x > 0 { x = 0; y += rowH + (lineSpacing ?? spacing); rowH = 0 }
            x += s.width + spacing
            rowH = max(rowH, s.height)
            widest = max(widest, x - spacing)
        }
        return CGSize(width: proposal.width ?? widest, height: y + rowH)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += rowH + (lineSpacing ?? spacing); rowH = 0 }
            v.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
            x += s.width + spacing
            rowH = max(rowH, s.height)
        }
    }
}
