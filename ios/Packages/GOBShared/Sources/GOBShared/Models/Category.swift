import Foundation

public struct Category: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let subcategories: [String]
}
