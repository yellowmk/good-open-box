import SwiftUI
import GOBShared

struct DriverDashboardView: View {
    @Environment(AuthManager.self) private var auth
    @State private var dashboard: DriverDashboard?
    @State private var stripeStatus: StripeStatusResponse?
    @State private var isLoading = true
    @State private var showStripeOnboard = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Stripe banner
                if let stripe = stripeStatus, !stripe.connected {
                    Button { showStripeOnboard = true } label: {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.orange)
                            VStack(alignment: .leading) {
                                Text("Set Up Payouts")
                                    .font(.subheadline.bold())
                                Text("Connect Stripe to receive earnings")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .background(.orange.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                }

                if let dash = dashboard {
                    // Today stats
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Today")
                            .font(.headline)
                        HStack(spacing: 16) {
                            StatCard(title: "Deliveries", value: "\(dash.todayDeliveries)", icon: "shippingbox.fill", color: .blue)
                            StatCard(title: "Earnings", value: String(format: "$%.2f", dash.todayEarnings), icon: "dollarsign.circle.fill", color: .green)
                        }
                    }

                    // Total stats
                    VStack(alignment: .leading, spacing: 12) {
                        Text("All Time")
                            .font(.headline)
                        HStack(spacing: 16) {
                            StatCard(title: "Deliveries", value: "\(dash.totalDeliveries)", icon: "shippingbox.fill", color: .blue)
                            StatCard(title: "Earnings", value: String(format: "$%.2f", dash.totalEarnings), icon: "dollarsign.circle.fill", color: .green)
                        }
                    }

                    // Active deliveries
                    if !dash.active.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Active Deliveries")
                                .font(.headline)
                            ForEach(dash.active) { delivery in
                                NavigationLink(destination: ActiveDeliveryView(delivery: delivery)) {
                                    DeliveryCard(delivery: delivery)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color.driverPageBg)
        .navigationTitle("Dashboard")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink(destination: DriverProfileView()) {
                    Image(systemName: "person.circle")
                }
            }
        }
        .overlay { if isLoading { ProgressView() } }
        .refreshable { await loadData() }
        .task { await loadData() }
        .sheet(isPresented: $showStripeOnboard) {
            StripeOnboardingView()
        }
    }

    private func loadData() async {
        isLoading = true
        async let dashReq = try? APIClient.shared.request(.driverDashboard, as: DriverDashboardResponse.self)
        async let stripeReq = try? APIClient.shared.request(.driverStripeStatus, as: StripeStatusResponse.self)

        let (dashRes, stripeRes) = await (dashReq, stripeReq)
        dashboard = dashRes?.dashboard
        stripeStatus = stripeRes
        isLoading = false
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title2.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct DeliveryCard: View {
    let delivery: Delivery

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Order \(delivery.orderId)")
                    .font(.subheadline.bold())
                Spacer()
                Text(delivery.statusDisplay)
                    .font(.caption.weight(.medium))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.driverAmber.opacity(0.15))
                    .foregroundStyle(Color.driverAmberDark)
                    .clipShape(Capsule())
            }
            if let addr = delivery.deliveryAddress {
                Label(addr.formatted, systemImage: "location.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(String(format: "$%.2f", delivery.deliveryFee))
                .font(.subheadline.bold())
                .foregroundStyle(Color.driverAmber)
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
