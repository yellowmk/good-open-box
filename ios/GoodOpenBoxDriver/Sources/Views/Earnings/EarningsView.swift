import SwiftUI
import GOBShared

struct EarningsView: View {
    @State private var earnings: DriverEarnings?
    @State private var payouts: [DriverPayout] = []
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if let earnings {
                    // Summary cards
                    HStack(spacing: 16) {
                        StatCard(
                            title: "Total Earnings",
                            value: String(format: "$%.2f", earnings.totalEarnings),
                            icon: "dollarsign.circle.fill",
                            color: .green
                        )
                        StatCard(
                            title: "Deliveries",
                            value: "\(earnings.deliveryCount)",
                            icon: "shippingbox.fill",
                            color: .blue
                        )
                    }

                    if earnings.deliveryCount > 0 {
                        StatCard(
                            title: "Average Per Delivery",
                            value: String(format: "$%.2f", earnings.totalEarnings / Double(earnings.deliveryCount)),
                            icon: "chart.bar.fill",
                            color: .purple
                        )
                    }
                }

                // Payout history
                if !payouts.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Payout History")
                            .font(.headline)

                        ForEach(payouts) { payout in
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(String(format: "$%.2f", payout.amount))
                                        .font(.subheadline.bold())
                                    Text("\(payout.deliveryCount) deliveries")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(payout.createdAt.prefix(10))
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(payout.status.capitalized)
                                    .font(.caption.weight(.medium))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(payout.status == "paid" ? Color.green.opacity(0.1) : Color.orange.opacity(0.1))
                                    .foregroundStyle(payout.status == "paid" ? .green : .orange)
                                    .clipShape(Capsule())
                            }
                            .padding()
                            .background(.regularMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color.driverPageBg)
        .navigationTitle("Earnings")
        .overlay { if isLoading { ProgressView() } }
        .refreshable { await loadEarnings() }
        .task { await loadEarnings() }
    }

    private func loadEarnings() async {
        isLoading = true
        let response = try? await APIClient.shared.request(.driverEarnings, as: DriverEarningsResponse.self)
        earnings = response?.earnings
        payouts = response?.payouts ?? []
        isLoading = false
    }
}
