import SwiftUI
import GOBShared

struct MyDeliveriesView: View {
    @State private var deliveries: [Delivery] = []
    @State private var filter = "active"
    @State private var isLoading = true

    private var filteredDeliveries: [Delivery] {
        switch filter {
        case "active":
            return deliveries.filter { $0.status != "delivered" && $0.status != "failed" }
        case "completed":
            return deliveries.filter { $0.status == "delivered" || $0.status == "failed" }
        default:
            return deliveries
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            Picker("Filter", selection: $filter) {
                Text("Active").tag("active")
                Text("Completed").tag("completed")
            }
            .pickerStyle(.segmented)
            .padding()

            if filteredDeliveries.isEmpty && !isLoading {
                ContentUnavailableView(
                    filter == "active" ? "No Active Deliveries" : "No Completed Deliveries",
                    systemImage: "shippingbox"
                )
            } else {
                List(filteredDeliveries) { delivery in
                    NavigationLink(destination: ActiveDeliveryView(delivery: delivery)) {
                        DeliveryCard(delivery: delivery)
                    }
                    .buttonStyle(.plain)
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                }
                .listStyle(.plain)
                .refreshable { await loadDeliveries() }
            }
        }
        .background(Color.driverPageBg)
        .navigationTitle("My Deliveries")
        .overlay { if isLoading { ProgressView() } }
        .task { await loadDeliveries() }
    }

    private func loadDeliveries() async {
        isLoading = true
        let response = try? await APIClient.shared.request(.myDeliveries(status: nil), as: DeliveryListResponse.self)
        deliveries = response?.deliveries ?? []
        isLoading = false
    }
}
