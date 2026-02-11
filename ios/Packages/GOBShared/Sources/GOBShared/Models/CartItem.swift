import Foundation

public struct CartItem: Codable, Identifiable, Sendable {
    public let product: Product
    public var quantity: Int

    public var id: String { product.id }
    public var lineTotal: Double { product.price * Double(quantity) }

    public init(product: Product, quantity: Int = 1) {
        self.product = product
        self.quantity = quantity
    }
}
