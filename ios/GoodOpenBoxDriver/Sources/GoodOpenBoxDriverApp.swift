import SwiftUI
import GOBShared

@main
struct GoodOpenBoxDriverApp: App {
    @State private var authManager = AuthManager.shared

    var body: some Scene {
        WindowGroup {
            DriverContentView()
                .environment(authManager)
                .task {
                    await authManager.restoreSession()
                }
        }
    }
}
