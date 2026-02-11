import Foundation

@Observable
public final class AuthManager: @unchecked Sendable {
    public static let shared = AuthManager()

    public private(set) var currentUser: User?
    public private(set) var isAuthenticated = false
    public private(set) var isLoading = false
    public var error: String?

    private init() {}

    @MainActor
    public func login(email: String, password: String) async throws {
        isLoading = true
        error = nil
        defer { isLoading = false }

        let response = try await APIClient.shared.request(
            .login(email: email, password: password),
            as: AuthResponse.self
        )

        guard response.success, let token = response.token, let user = response.user else {
            let msg = response.message ?? "Login failed"
            error = msg
            throw APIError.badRequest(msg)
        }

        await KeychainService.shared.saveToken(token)
        currentUser = user
        isAuthenticated = true
    }

    @MainActor
    public func register(name: String, email: String, password: String, role: String? = nil) async throws {
        isLoading = true
        error = nil
        defer { isLoading = false }

        let response = try await APIClient.shared.request(
            .register(name: name, email: email, password: password, role: role),
            as: AuthResponse.self
        )

        guard response.success, let token = response.token, let user = response.user else {
            let msg = response.message ?? "Registration failed"
            error = msg
            throw APIError.badRequest(msg)
        }

        await KeychainService.shared.saveToken(token)
        currentUser = user
        isAuthenticated = true
    }

    @MainActor
    public func restoreSession() async {
        guard let token = await KeychainService.shared.getToken(), !token.isEmpty else { return }
        do {
            let response = try await APIClient.shared.request(.me, as: UserResponse.self)
            if response.success {
                currentUser = response.user
                isAuthenticated = true
            }
        } catch {
            await logout()
        }
    }

    @MainActor
    public func logout() async {
        await KeychainService.shared.deleteToken()
        currentUser = nil
        isAuthenticated = false
        error = nil
    }

    @MainActor
    public func handleUnauthorized() {
        Task { await logout() }
    }
}
