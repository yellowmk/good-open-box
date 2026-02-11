import Foundation

public struct Product: Codable, Identifiable, Sendable, Hashable {
    public let id: String
    public let vendorId: String?
    public let vendorName: String?
    public let name: String
    public let slug: String?
    public let description: String
    public let price: Double
    public let compareAtPrice: Double?
    public let category: String
    public let subcategory: String?
    public let brand: String?
    public let condition: String
    public let stock: Int
    public let sku: String?
    public let images: [String]
    public let tags: [String]?
    public let rating: Double?
    public let numReviews: Int?
    public let isFeatured: Bool?

    public var discountPercent: Int? {
        guard let compareAt = compareAtPrice, compareAt > price else { return nil }
        return Int(((compareAt - price) / compareAt) * 100)
    }

    public var firstImageURL: URL? {
        guard let first = images.first else { return nil }
        return URL(string: first)
    }

    public static func == (lhs: Product, rhs: Product) -> Bool {
        lhs.id == rhs.id
    }

    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
