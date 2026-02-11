import Foundation

// MARK: - Generic
public struct APIResponse<T: Codable & Sendable>: Codable, Sendable {
    public let success: Bool
    public let message: String?

    enum CodingKeys: String, CodingKey {
        case success, message
    }
}

// MARK: - Auth
public struct AuthResponse: Codable, Sendable {
    public let success: Bool
    public let token: String?
    public let user: User?
    public let message: String?
}

// MARK: - Products
public struct ProductListResponse: Codable, Sendable {
    public let success: Bool
    public let products: [Product]
    public let pagination: Pagination?
}

public struct Pagination: Codable, Sendable {
    public let page: Int
    public let limit: Int
    public let total: Int
    public let pages: Int
}

public struct ProductDetailResponse: Codable, Sendable {
    public let success: Bool
    public let product: Product
}

// MARK: - Categories
public struct CategoryListResponse: Codable, Sendable {
    public let success: Bool
    public let categories: [ProductCategory]
}

// MARK: - Orders
public struct OrderListResponse: Codable, Sendable {
    public let success: Bool
    public let orders: [Order]
}

public struct OrderDetailResponse: Codable, Sendable {
    public let success: Bool
    public let order: Order
}

public struct CheckoutSessionResponse: Codable, Sendable {
    public let success: Bool
    public let sessionUrl: String?
    public let orderId: String?
    public let message: String?
}

// MARK: - Deliveries
public struct DeliveryListResponse: Codable, Sendable {
    public let success: Bool
    public let deliveries: [Delivery]
}

public struct DeliveryDetailResponse: Codable, Sendable {
    public let success: Bool
    public let delivery: Delivery
}

public struct DeliveryStatusResponse: Codable, Sendable {
    public let success: Bool
    public let delivery: Delivery?
}

// MARK: - Driver
public struct DriverDashboardResponse: Codable, Sendable {
    public let success: Bool
    public let dashboard: DriverDashboard
}

public struct DriverEarningsResponse: Codable, Sendable {
    public let success: Bool
    public let earnings: DriverEarnings
    public let payouts: [DriverPayout]?
}

public struct DriverApplicationResponse: Codable, Sendable {
    public let success: Bool
    public let application: DriverApplication?
    public let message: String?
}

public struct StripeStatusResponse: Codable, Sendable {
    public let success: Bool
    public let connected: Bool
    public let payoutsEnabled: Bool?
    public let detailsSubmitted: Bool?
    public let stripeAccountId: String?
}

public struct StripeOnboardResponse: Codable, Sendable {
    public let success: Bool
    public let url: String?
    public let message: String?
}

// MARK: - Delivery Fee
public struct DeliveryFeeResponse: Codable, Sendable {
    public let success: Bool
    public let fee: Double?
    public let miles: Double?
    public let message: String?
}

// MARK: - AI
public struct AIChatResponse: Codable, Sendable {
    public let success: Bool
    public let reply: String?
    public let products: [Product]?
    public let updatedMessages: [ChatMessage]?
    public let message: String?
}

public struct ChatMessage: Codable, Sendable, Identifiable {
    public let role: String
    public let content: String

    public var id: String { "\(role)-\(content.prefix(20))-\(content.count)" }

    public init(role: String, content: String) {
        self.role = role
        self.content = content
    }
}

public struct AIRecommendationsResponse: Codable, Sendable {
    public let success: Bool
    public let products: [Product]?
    public let explanation: String?
    public let message: String?
}

public struct AISearchResponse: Codable, Sendable {
    public let success: Bool
    public let products: [Product]?
    public let summary: String?
    public let message: String?
}

// MARK: - User
public struct UserResponse: Codable, Sendable {
    public let success: Bool
    public let user: User
}
