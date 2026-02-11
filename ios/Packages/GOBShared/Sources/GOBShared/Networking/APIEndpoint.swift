import Foundation

public enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

public enum APIEndpoint {
    // Auth
    case login(email: String, password: String)
    case register(name: String, email: String, password: String, role: String?)
    case me

    // Products
    case products(category: String?, condition: String?, search: String?, sort: String?, minPrice: Double?, maxPrice: Double?, page: Int?, limit: Int?)
    case featuredProducts
    case productDetail(id: String)

    // Categories
    case categories

    // Orders
    case createOrder(items: [[String: Any]], shippingAddress: [String: String])
    case checkoutSession(items: [[String: Any]], shippingAddress: [String: String])
    case orders
    case orderDetail(id: String)

    // Deliveries
    case availableDeliveries
    case claimDelivery(id: Int)
    case myDeliveries(status: String?)
    case updateDeliveryStatus(id: Int, status: String, notes: String?)
    case deliveryStatus(orderId: String)

    // Drivers
    case driverApply(data: [String: Any])
    case driverDashboard
    case driverEarnings
    case driverStripeOnboard
    case driverStripeStatus

    // Delivery Fee
    case deliveryFee(street: String, city: String, state: String, zip: String)

    // AI
    case aiChat(messages: [ChatMessage])
    case aiSearch(query: String)
    case aiRecommendations(productId: String)

    var path: String {
        switch self {
        case .login: return "/auth/login"
        case .register: return "/auth/register"
        case .me: return "/auth/me"
        case .products: return "/products"
        case .featuredProducts: return "/products/featured"
        case .productDetail(let id): return "/products/\(id)"
        case .categories: return "/categories"
        case .createOrder: return "/orders"
        case .checkoutSession: return "/orders/checkout-session"
        case .orders: return "/orders"
        case .orderDetail(let id): return "/orders/\(id)"
        case .availableDeliveries: return "/deliveries/available"
        case .claimDelivery(let id): return "/deliveries/\(id)/claim"
        case .myDeliveries: return "/deliveries/my-deliveries"
        case .updateDeliveryStatus(let id, _, _): return "/deliveries/\(id)/status"
        case .deliveryStatus(let orderId): return "/deliveries/\(orderId)/status"
        case .driverApply: return "/drivers/apply"
        case .driverDashboard: return "/drivers/dashboard"
        case .driverEarnings: return "/drivers/earnings"
        case .driverStripeOnboard: return "/drivers/stripe/onboard"
        case .driverStripeStatus: return "/drivers/stripe/status"
        case .deliveryFee: return "/delivery-fee"
        case .aiChat: return "/ai/chat"
        case .aiSearch: return "/ai/search"
        case .aiRecommendations(let id): return "/ai/recommendations/\(id)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .login, .register, .createOrder, .checkoutSession, .claimDelivery,
             .driverApply, .driverStripeOnboard, .aiChat, .aiSearch:
            return .post
        case .updateDeliveryStatus:
            return .put
        default:
            return .get
        }
    }

    var body: Data? {
        switch self {
        case .login(let email, let password):
            return encode(["email": email, "password": password])
        case .register(let name, let email, let password, let role):
            var dict: [String: String] = ["name": name, "email": email, "password": password]
            if let role { dict["role"] = role }
            return encode(dict)
        case .createOrder(let items, let address):
            return encode(["items": items, "shippingAddress": address] as [String: Any])
        case .checkoutSession(let items, let address):
            return encode(["items": items, "shippingAddress": address] as [String: Any])
        case .updateDeliveryStatus(_, let status, let notes):
            var dict: [String: String] = ["status": status]
            if let notes { dict["notes"] = notes }
            return encode(dict)
        case .driverApply(let data):
            return encode(data)
        case .aiChat(let messages):
            let msgs = messages.map { ["role": $0.role, "content": $0.content] }
            return encode(["messages": msgs])
        case .aiSearch(let query):
            return encode(["query": query])
        default:
            return nil
        }
    }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .products(let category, let condition, let search, let sort, let minPrice, let maxPrice, let page, let limit):
            var items: [URLQueryItem] = []
            if let v = category { items.append(.init(name: "category", value: v)) }
            if let v = condition { items.append(.init(name: "condition", value: v)) }
            if let v = search { items.append(.init(name: "search", value: v)) }
            if let v = sort { items.append(.init(name: "sort", value: v)) }
            if let v = minPrice { items.append(.init(name: "minPrice", value: String(v))) }
            if let v = maxPrice { items.append(.init(name: "maxPrice", value: String(v))) }
            if let v = page { items.append(.init(name: "page", value: String(v))) }
            if let v = limit { items.append(.init(name: "limit", value: String(v))) }
            return items.isEmpty ? nil : items
        case .myDeliveries(let status):
            if let status { return [.init(name: "status", value: status)] }
            return nil
        case .deliveryFee(let street, let city, let state, let zip):
            return [
                .init(name: "street", value: street),
                .init(name: "city", value: city),
                .init(name: "state", value: state),
                .init(name: "zip", value: zip)
            ]
        default:
            return nil
        }
    }

    public func urlRequest(token: String? = nil) -> URLRequest {
        var components = URLComponents(string: Constants.baseURL + path)!
        components.queryItems = queryItems
        var request = URLRequest(url: components.url!)
        request.httpMethod = method.rawValue
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    private func encode(_ dict: [String: Any]) -> Data? {
        try? JSONSerialization.data(withJSONObject: dict)
    }

    private func encode(_ dict: [String: String]) -> Data? {
        try? JSONSerialization.data(withJSONObject: dict)
    }
}
