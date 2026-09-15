// Widget iOS (WidgetKit) — FICHIER DE RÉFÉRENCE, PAS ENCORE INTÉGRÉ AU
// PROJET XCODE.
//
// Comme le reste de l'intégration Apple (voir StoreKitPlugin.swift), ce
// code n'a pas pu être compilé ni testé dans cet environnement de
// développement (pas d'accès à macOS/Xcode). Étapes manuelles nécessaires
// depuis un Mac avant que ce widget existe réellement :
//
// 1. Dans Xcode : File > New > Target… > Widget Extension. Nommez-la
//    "AstrologiaWidget", décochez "Include Live Activity" (pas nécessaire
//    ici), laissez "Include Configuration Intent" décoché pour un widget
//    non configurable dans un premier temps.
// 2. Supprimez le fichier Swift généré par défaut par Xcode dans le
//    nouveau target, et ajoutez ce fichier-ci à sa place (clic droit sur
//    le groupe du target > Add Files to "App"…), en cochant bien la cible
//    "AstrologiaWidget" (pas "App").
// 3. Le widget doit connaître l'URL de résumé du jour
//    (`/api/widget/theme-natal/[id]?token=...`, visible et copiable
//    depuis la page "Thème natal" du site une fois connecté). Pour un
//    premier jet sans configuration UI, le plus simple est de la stocker
//    dans un App Group partagé entre l'app principale et le widget
//    (Signing & Capabilities > + Capability > App Groups sur les DEUX
//    targets, même identifiant ex. "group.com.astrologia.app"), écrite
//    depuis la webview Capacitor via un petit plugin natif (sur le même
//    principe que StoreKitPlugin.swift) qui appelle
//    `UserDefaults(suiteName:)` avec l'URL copiée par l'utilisateur.
// 4. Activer la capability "App Groups" identique sur les deux targets
//    est nécessaire pour que `UserDefaults(suiteName:)` fonctionne.
//
// Le widget affiche : signe du jour (Big 3), phase lunaire du jour, et le
// transit le plus marquant — même contenu que la page "Transits du jour"
// et l'e-mail quotidien, condensé pour l'écran d'accueil.

import WidgetKit
import SwiftUI

struct DailySummary: Decodable {
    let label: String
    let date: String
    let sunSign: String
    let sunSymbol: String
    let moonSign: String
    let ascendantSign: String?
    let moonPhase: String
    let moonIlluminatedPercent: Int
    let transitHeadline: String?
}

struct AstrologiaEntry: TimelineEntry {
    let date: Date
    let summary: DailySummary?
}

struct AstrologiaProvider: TimelineProvider {
    // Remplacé à l'exécution par la valeur lue dans l'App Group partagé
    // (voir étape 3 ci-dessus) — codée en dur ici uniquement pour que ce
    // fichier reste lisible comme référence autonome.
    static let appGroupId = "group.com.astrologia.app"
    static let widgetUrlDefaultsKey = "astrologia.widgetUrl"

    func placeholder(in context: Context) -> AstrologiaEntry {
        AstrologiaEntry(date: Date(), summary: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (AstrologiaEntry) -> Void) {
        completion(AstrologiaEntry(date: Date(), summary: nil))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AstrologiaEntry>) -> Void) {
        Task {
            let summary = await fetchSummary()
            let entry = AstrologiaEntry(date: Date(), summary: summary)
            // Rafraîchit une fois par jour — un thème du jour n'a pas besoin
            // d'une fréquence plus élevée, et ça économise la batterie.
            let nextUpdate = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date().addingTimeInterval(6 * 3600)
            completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
        }
    }

    private func fetchSummary() async -> DailySummary? {
        guard
            let defaults = UserDefaults(suiteName: Self.appGroupId),
            let urlString = defaults.string(forKey: Self.widgetUrlDefaultsKey),
            let url = URL(string: urlString)
        else { return nil }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return try JSONDecoder().decode(DailySummary.self, from: data)
        } catch {
            return nil
        }
    }
}

struct AstrologiaWidgetView: View {
    var entry: AstrologiaEntry

    var body: some View {
        if let summary = entry.summary {
            VStack(alignment: .leading, spacing: 6) {
                Text(summary.label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("\(summary.sunSymbol) \(summary.sunSign)")
                    .font(.headline)
                Text("☾ \(summary.moonPhase) · \(summary.moonIlluminatedPercent)%")
                    .font(.caption)
                if let headline = summary.transitHeadline {
                    Text(headline)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
            .padding()
        } else {
            Text("Ouvrez Astrologia pour configurer le widget")
                .font(.caption)
                .padding()
        }
    }
}

struct AstrologiaWidget: Widget {
    let kind: String = "AstrologiaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AstrologiaProvider()) { entry in
            AstrologiaWidgetView(entry: entry)
        }
        .configurationDisplayName("Astrologia — Thème du jour")
        .description("Signe, phase lunaire et transit du jour.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
