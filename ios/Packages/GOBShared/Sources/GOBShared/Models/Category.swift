import Foundation

public struct ProductCategory: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let subcategories: [String]
}
