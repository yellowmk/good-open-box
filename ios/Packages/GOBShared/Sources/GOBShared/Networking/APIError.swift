import Foundation

public enum APIError: Error, LocalizedError {
    case unauthorized
    case forbidden
    case notFound
    case badRequest(String)
    case serverError(String)
    case networkError(Error)
    case decodingError(Error)
    case unknown

    public var errorDescription: String? {
        switch self {
        case .unauthorized: return "Please sign in to continue."
        case .forbidden: return "You don't have permission for this action."
        case .notFound: return "The requested resource was not found."
        case .badRequest(let msg): return msg
        case .serverError(let msg): return msg
        case .networkError(let err): return err.localizedDescription
        case .decodingError: return "Failed to process server response."
        case .unknown: return "An unexpected error occurred."
        }
    }
}
