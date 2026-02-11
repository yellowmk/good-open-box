import SwiftUI
import GOBShared

struct ContentView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(CartViewModel.self) private var cart

    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }

            NavigationStack {
                ProductListView()
            }
            .tabItem {
                Label("Search", systemImage: "magnifyingglass")
            }

            NavigationStack {
                CartView()
            }
            .tabItem {
                Label("Cart", systemImage: "cart.fill")
            }
            .badge(cart.itemCount)

            NavigationStack {
                if auth.isAuthenticated {
                    OrderListView()
                } else {
                    LoginView()
                }
            }
            .tabItem {
                Label("Orders", systemImage: "shippingbox.fill")
            }

            NavigationStack {
                if auth.isAuthenticated {
                    ProfileView()
                } else {
                    LoginView()
                }
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
        .tint(Color.brandAmber)
    }
}

// MARK: - Brand Colors
extension Color {
    static let brandAmber = Color(red: 251/255, green: 191/255, blue: 36/255)
    static let brandAmberDark = Color(red: 245/255, green: 158/255, blue: 11/255)
    static let brandTeal = Color(red: 13/255, green: 148/255, blue: 136/255)
    static let pageBackground = Color(red: 243/255, green: 244/255, blue: 246/255)
}
