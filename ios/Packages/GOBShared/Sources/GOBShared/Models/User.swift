import Foundation

public struct User: Codable, Identifiable, Sendable {
    public let id: IntOrString
    public let name: String
    public let email: String
    public let role: String
    public let vendorId: String?
    public let isApproved: Bool?
    public let joinedAt: String?
    public let stripeAccountId: String?
    public let stripeOnboardingComplete: Bool?

    public init(id: IntOrString, name: String, email: String, role: String, vendorId: String? = nil, isApproved: Bool? = nil, joinedAt: String? = nil, stripeAccountId: String? = nil, stripeOnboardingComplete: Bool? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.vendorId = vendorId
        self.isApproved = isApproved
        self.joinedAt = joinedAt
        self.stripeAccountId = stripeAccountId
        self.stripeOnboardingComplete = stripeOnboardingComplete
    }

    enum CodingKeys: String, CodingKey {
        case id, name, email, role, vendorId, isApproved, joinedAt
        case stripeAccountId = "stripe_account_id"
        case stripeOnboardingComplete = "stripe_onboarding_complete"
    }
}

/// Handles JSON values that may be int or string
public enum IntOrString: Codable, Hashable, Sendable {
    case int(Int)
    case string(String)

    public var stringValue: String {
        switch self {
        case .int(let v): return String(v)
        case .string(let v): return v
        }
    }

    public var intValue: Int? {
        switch self {
        case .int(let v): return v
        case .string(let v): return Int(v)
        }
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let v = try? container.decode(Int.self) {
            self = .int(v)
        } else if let v = try? container.decode(String.self) {
            self = .string(v)
        } else {
            throw DecodingError.typeMismatch(IntOrString.self, .init(codingPath: decoder.codingPath, debugDescription: "Expected Int or String"))
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .int(let v): try container.encode(v)
        case .string(let v): try container.encode(v)
        }
    }
}
