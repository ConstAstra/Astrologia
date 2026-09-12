//
//  StoreKitPlugin.swift
//  Astrologia — pont Capacitor vers StoreKit 2 pour les achats Apple
//  (abonnement Premium + packs de crédits à l'unité).
//
//  Installation manuelle requise (fichier non ajouté automatiquement au
//  projet Xcode depuis cet environnement de développement, qui n'a pas
//  accès à Xcode) :
//    1. Ouvrez ios/App/App.xcworkspace dans Xcode.
//    2. Clic droit sur le groupe "App" > "Add Files to App..."
//    3. Sélectionnez ce fichier, en cochant la cible "App".
//    4. Activez la capability "In-App Purchase" dans
//       Signing & Capabilities.
//    5. Créez vos produits (abonnements + consommables) dans App Store
//       Connect avec les identifiants définis dans
//       src/lib/billing/plans.ts (APPLE_PRODUCT_MAP).
//
//  Ce fichier n'a pas pu être compilé ni testé dans cette session (pas de
//  Mac/Xcode disponible) : à valider en simulateur/sandbox avant mise en
//  production.

import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]

    private var updatesTask: Task<Void, Never>?

    @objc override public func load() {
        // Écoute les transactions qui arrivent hors du flux d'achat direct
        // (renouvellements silencieux, achats Ask-to-Buy validés plus
        // tard...) et les transmet au site pour vérification serveur.
        updatesTask = Task.detached { [weak self] in
            for await result in Transaction.updates {
                await self?.forwardTransaction(result)
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("productIds", String.self), !ids.isEmpty else {
            call.reject("productIds requis")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: ids)
                let payload = products.map { product -> [String: Any] in
                    [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "displayPrice": product.displayPrice,
                        "isSubscription": product.subscription != nil
                    ]
                }
                call.resolve(["products": payload])
            } catch {
                call.reject("Impossible de charger les produits: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId requis")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Produit introuvable: \(productId)")
                    return
                }

                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    await self.resolveWithTransaction(verification, call: call)
                case .userCancelled:
                    call.reject("CANCELLED", "Achat annulé par l'utilisateur")
                case .pending:
                    call.reject("PENDING", "Achat en attente (ex: autorisation parentale)")
                @unknown default:
                    call.reject("Résultat d'achat inconnu")
                }
            } catch {
                call.reject("Échec de l'achat: \(error.localizedDescription)")
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                var restored: [[String: Any]] = []
                for await result in Transaction.currentEntitlements {
                    if case .verified(let transaction) = result {
                        restored.append([
                            "productId": transaction.productID,
                            "signedTransactionInfo": result.jwsRepresentation
                        ])
                    }
                }
                call.resolve(["transactions": restored])
            } catch {
                call.reject("Échec de la restauration: \(error.localizedDescription)")
            }
        }
    }

    private func resolveWithTransaction(_ verification: VerificationResult<Transaction>, call: CAPPluginCall) async {
        switch verification {
        case .verified(let transaction):
            call.resolve([
                "productId": transaction.productID,
                "transactionId": String(transaction.id),
                "signedTransactionInfo": verification.jwsRepresentation
            ])
            await transaction.finish()
        case .unverified:
            call.reject("Transaction non vérifiée par l'appareil (jailbreak/signature invalide ?)")
        }
    }

    private func forwardTransaction(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result else { return }
        notifyListeners("transactionUpdate", data: [
            "productId": transaction.productID,
            "signedTransactionInfo": result.jwsRepresentation
        ])
        await transaction.finish()
    }
}
