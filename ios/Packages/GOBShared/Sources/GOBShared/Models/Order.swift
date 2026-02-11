import Foundation

public struct Order: Codable, Identifiable, Sendable {
    public let id: String
    public let userId: IntOrString?
    public let items: [OrderItem]
    public let shippingAddress: ShippingAddress?
    public let paymentMethod: String?
    public let subtotal: Double
    public let tax: Double
    public let shippingCost: Double
    public let total: Double
    public let status: String
    public let isPaid: Bool
    public let isDelivered: Bool
    public let paidAt: String?
    public let stripePaymentIntentId: String?
    public let refundStatus: String?
    public let refundedAmount: Double?
    public let createdAt: String?

    public var statusDisplay: String {
        switch status {
        case "pending": return "Pending"
        case "pending_payment": return "Awaiting Payment"
        case "confirmed": return "Confirmed"
        case "shipped": return "Shipped"
        case "delivered": return "Delivered"
        case "cancelled": return "Cancelled"
        default: return status.capitalized
        }
    }
}

public struct OrderItem: Codable, Sendable, Identifiable {
    public let productId: String
    public let name: String
    public let price: Double
    public let quantity: Int
    public let vendorId: String?

    public var id: String { productId }
}

public struct ShippingAddress: Codable, Sendable {
    public let street: String?
    public let city: String?
    public let state: String?
    public let zip: String?
    public let name: String?
    public let phone: String?

    public init(street: String, city: String, state: String, zip: String, name: String? = nil, phone: String? = nil) {
        self.street = street
        self.city = city
        self.state = state
        self.zip = zip
        self.name = name
        self.phone = phone
    }

    public var formatted: String {
        [street, city, state, zip].compactMap { $0 }.joined(separator: ", ")
    }
}
