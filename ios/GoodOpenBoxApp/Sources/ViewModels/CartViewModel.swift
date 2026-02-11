import Foundation
import GOBShared

@Observable
final class CartViewModel: @unchecked Sendable {
    private(set) var items: [CartItem] = []
    private let storageKey = "gob_cart_items"

    var itemCount: Int { items.reduce(0) { $0 + $1.quantity } }
    var subtotal: Double { items.reduce(0) { $0 + $1.lineTotal } }
    var tax: Double { subtotal * Constants.taxRate }
    var shipping: Double { subtotal >= Constants.freeShippingThreshold ? 0 : Constants.shippingCost }
    var total: Double { subtotal + tax + shipping }

    init() {
        loadFromDisk()
    }

    func addToCart(_ product: Product, quantity: Int = 1) {
        if let idx = items.firstIndex(where: { $0.product.id == product.id }) {
            items[idx].quantity += quantity
        } else {
            items.append(CartItem(product: product, quantity: quantity))
        }
        saveToDisk()
    }

    func updateQuantity(productId: String, quantity: Int) {
        if quantity <= 0 {
            removeFromCart(productId: productId)
            return
        }
        if let idx = items.firstIndex(where: { $0.product.id == productId }) {
            items[idx].quantity = quantity
            saveToDisk()
        }
    }

    func removeFromCart(productId: String) {
        items.removeAll { $0.product.id == productId }
        saveToDisk()
    }

    func clear() {
        items.removeAll()
        saveToDisk()
    }

    var checkoutItems: [[String: Any]] {
        items.map { ["productId": $0.product.id, "quantity": $0.quantity] }
    }

    private func saveToDisk() {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadFromDisk() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([CartItem].self, from: data) else { return }
        items = decoded
    }
}
