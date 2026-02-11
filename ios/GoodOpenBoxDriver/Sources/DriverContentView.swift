import SwiftUI
import GOBShared

struct DriverContentView: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        Group {
            if auth.isAuthenticated && auth.currentUser?.role == "driver" {
                TabView {
                    Tab("Dashboard", systemImage: "gauge.with.dots.needle.bottom.50percent") {
                        NavigationStack { DriverDashboardView() }
                    }
                    Tab("Available", systemImage: "shippingbox.fill") {
                        NavigationStack { AvailableDeliveriesView() }
                    }
                    Tab("My Deliveries", systemImage: "list.bullet.clipboard.fill") {
                        NavigationStack { MyDeliveriesView() }
                    }
                    Tab("Earnings", systemImage: "dollarsign.circle.fill") {
                        NavigationStack { EarningsView() }
                    }
                }
                .tint(Color.driverAmber)
            } else {
                NavigationStack { DriverLoginView() }
            }
        }
    }
}

// MARK: - Driver Brand Colors
extension Color {
    static let driverAmber = Color(red: 251/255, green: 191/255, blue: 36/255)
    static let driverAmberDark = Color(red: 245/255, green: 158/255, blue: 11/255)
    static let driverTeal = Color(red: 13/255, green: 148/255, blue: 136/255)
    static let driverPageBg = Color(red: 243/255, green: 244/255, blue: 246/255)
}
