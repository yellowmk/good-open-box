import Foundation

public struct Delivery: Codable, Identifiable, Sendable {
    public let id: Int
    public let orderId: String
    public let driverId: Int?
    public let driverName: String?
    public let assignmentType: String?
    public let status: String
    public let deliveryFee: Double
    public let pickupAddress: ShippingAddress?
    public let deliveryAddress: ShippingAddress?
    public let assignedAt: String?
    public let pickedUpAt: String?
    public let enRouteAt: String?
    public let deliveredAt: String?
    public let estimatedDelivery: String?
    public let driverNotes: String?
    public let createdAt: String?

    public var statusDisplay: String {
        switch status {
        case "pending": return "Pending"
        case "assigned", "claimed": return "Assigned"
        case "picked_up": return "Picked Up"
        case "en_route": return "En Route"
        case "delivered": return "Delivered"
        case "failed": return "Failed"
        default: return status.capitalized
        }
    }

    public var statusStep: Int {
        switch status {
        case "pending": return 0
        case "assigned", "claimed": return 1
        case "picked_up": return 2
        case "en_route": return 3
        case "delivered": return 4
        default: return 0
        }
    }

    public static let allStatuses = ["pending", "assigned", "picked_up", "en_route", "delivered"]
}

public struct DriverApplication: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let email: String
    public let phone: String
    public let vehicleType: String
    public let vehicleYear: Int?
    public let vehicleMake: String?
    public let vehicleModel: String?
    public let licenseNumber: String
    public let licenseState: String
    public let status: String
    public let notes: String?
    public let appliedAt: String?
}

public struct DriverDashboard: Codable, Sendable {
    public let todayDeliveries: Int
    public let todayEarnings: Double
    public let totalDeliveries: Int
    public let totalEarnings: Double
    public let activeDeliveries: Int
    public let active: [Delivery]
}

public struct DriverEarnings: Codable, Sendable {
    public let deliveryCount: Int
    public let totalEarnings: Double
}

public struct DriverPayout: Codable, Identifiable, Sendable {
    public let id: Int
    public let driverId: Int
    public let amount: Double
    public let periodStart: String
    public let periodEnd: String
    public let deliveryCount: Int
    public let status: String
    public let paidAt: String?
    public let paymentMethod: String
    public let notes: String?
    public let createdAt: String
}
