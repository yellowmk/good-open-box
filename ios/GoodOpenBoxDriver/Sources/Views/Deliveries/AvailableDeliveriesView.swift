import SwiftUI
import GOBShared

struct AvailableDeliveriesView: View {
    @State private var deliveries: [Delivery] = []
    @State private var isLoading = true
    @State private var claimingId: Int?

    var body: some View {
        Group {
            if deliveries.isEmpty && !isLoading {
                ContentUnavailableView("No Available Deliveries", systemImage: "shippingbox", description: Text("Pull to refresh for new deliveries"))
            } else {
                List(deliveries) { delivery in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Order \(delivery.orderId)")
                                .font(.subheadline.bold())
                            Spacer()
                            Text(String(format: "$%.2f", delivery.deliveryFee))
                                .font(.subheadline.bold())
                                .foregroundStyle(Color.driverAmber)
                        }

                        if let pickup = delivery.pickupAddress {
                            Label("Pickup: \(pickup.formatted)", systemImage: "arrow.up.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        if let dropoff = delivery.deliveryAddress {
                            Label("Deliver: \(dropoff.formatted)", systemImage: "arrow.down.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Button {
                            Task { await claim(delivery) }
                        } label: {
                            HStack {
                                Spacer()
                                if claimingId == delivery.id {
                                    ProgressView()
                                } else {
                                    Label("Claim Delivery", systemImage: "hand.raised.fill")
                                        .fontWeight(.semibold)
                                }
                                Spacer()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.driverAmber)
                        .disabled(claimingId != nil)
                    }
                    .padding(.vertical, 4)
                }
                .refreshable { await loadDeliveries() }
            }
        }
        .navigationTitle("Available")
        .overlay { if isLoading { ProgressView() } }
        .task { await loadDeliveries() }
    }

    private func loadDeliveries() async {
        isLoading = true
        let response = try? await APIClient.shared.request(.availableDeliveries, as: DeliveryListResponse.self)
        deliveries = response?.deliveries ?? []
        isLoading = false
    }

    private func claim(_ delivery: Delivery) async {
        claimingId = delivery.id
        if let _ = try? await APIClient.shared.request(.claimDelivery(id: delivery.id), as: DeliveryDetailResponse.self) {
            deliveries.removeAll { $0.id == delivery.id }
        }
        claimingId = nil
    }
}
