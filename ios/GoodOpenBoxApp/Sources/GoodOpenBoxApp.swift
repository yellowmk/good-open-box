import SwiftUI
import GOBShared

@main
struct GoodOpenBoxApp: App {
    @State private var authManager = AuthManager.shared
    @State private var cartVM = CartViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authManager)
                .environment(cartVM)
                .task {
                    await authManager.restoreSession()
                }
        }
    }
}
