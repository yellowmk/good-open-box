import SwiftUI
import GOBShared

struct OrderListView: View {
    @State private var orders: [Order] = []
    @State private var isLoading = true

    var body: some View {
        Group {
            if orders.isEmpty && !isLoading {
                ContentUnavailableView("No Orders Yet", systemImage: "shippingbox", description: Text("Your orders will appear here"))
            } else {
                List(orders) { order in
                    NavigationLink(destination: OrderDetailView(orderId: order.id)) {
                        OrderRow(order: order)
                    }
                }
                .refreshable { await loadOrders() }
            }
        }
        .navigationTitle("My Orders")
        .overlay {
            if isLoading { ProgressView() }
        }
        .task { await loadOrders() }
    }

    private func loadOrders() async {
        isLoading = true
        let response = try? await APIClient.shared.request(.orders, as: OrderListResponse.self)
        orders = response?.orders ?? []
        isLoading = false
    }
}

struct OrderRow: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(order.id)
                    .font(.subheadline.bold())
                Spacer()
                StatusBadge(status: order.status, isPaid: order.isPaid)
            }

            HStack {
                Text("\(order.items.count) item(s)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("$\(order.total, specifier: "%.2f")")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.brandAmber)
            }

            if let date = order.createdAt {
                Text(date.prefix(10))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct StatusBadge: View {
    let status: String
    var isPaid: Bool = false

    private var color: Color {
        switch status {
        case "delivered": return .green
        case "shipped", "en_route": return .blue
        case "confirmed", "picked_up": return .orange
        case "cancelled", "failed": return .red
        default: return .secondary
        }
    }

    var body: some View {
        HStack(spacing: 4) {
            if isPaid {
                Image(systemName: "checkmark.circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.green)
            }
            Text(status.replacingOccurrences(of: "_", with: " ").capitalized)
                .font(.caption.weight(.medium))
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1))
        .foregroundStyle(color)
        .clipShape(Capsule())
    }
}
