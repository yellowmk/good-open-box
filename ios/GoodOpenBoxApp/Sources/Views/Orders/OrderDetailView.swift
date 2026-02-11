import SwiftUI
import GOBShared

struct OrderDetailView: View {
    let orderId: String
    @State private var order: Order?
    @State private var delivery: Delivery?
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if let order {
                VStack(alignment: .leading, spacing: 20) {
                    // Status header
                    VStack(spacing: 8) {
                        Image(systemName: order.isPaid ? "checkmark.seal.fill" : "clock.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(order.isPaid ? .green : .orange)
                        Text(order.statusDisplay)
                            .font(.title3.bold())
                        if order.isPaid {
                            Text("Payment confirmed")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.regularMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Delivery tracking
                    if let delivery {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Delivery Status")
                                .font(.headline)
                            DeliveryStepperView(currentStep: delivery.statusStep)
                            if let notes = delivery.driverNotes, !notes.isEmpty {
                                Text("Driver notes: \(notes)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    // Items
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Items")
                            .font(.headline)
                        ForEach(order.items) { item in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(item.name)
                                        .font(.subheadline)
                                    Text("Qty: \(item.quantity)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("$\(item.price * Double(item.quantity), specifier: "%.2f")")
                                    .font(.subheadline)
                            }
                            if item.id != order.items.last?.id {
                                Divider()
                            }
                        }
                    }
                    .padding()
                    .background(.regularMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Payment summary
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Payment Summary")
                            .font(.headline)
                        SummaryRow(label: "Subtotal", value: order.subtotal)
                        SummaryRow(label: "Tax", value: order.tax)
                        SummaryRow(label: "Shipping", value: order.shippingCost)
                        Divider()
                        HStack {
                            Text("Total").fontWeight(.bold)
                            Spacer()
                            Text("$\(order.total, specifier: "%.2f")")
                                .fontWeight(.bold)
                                .foregroundStyle(Color.brandAmber)
                        }
                    }
                    .padding()
                    .background(.regularMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Shipping address
                    if let addr = order.shippingAddress {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Shipping Address")
                                .font(.headline)
                            Text(addr.formatted)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding()
            }
        }
        .background(Color.pageBackground)
        .navigationTitle("Order \(orderId)")
        .navigationBarTitleDisplayMode(.inline)
        .overlay { if isLoading { ProgressView() } }
        .task { await loadOrder() }
    }

    private func loadOrder() async {
        isLoading = true
        async let orderReq = try? APIClient.shared.request(.orderDetail(id: orderId), as: OrderDetailResponse.self)
        async let deliveryReq = try? APIClient.shared.request(.deliveryStatus(orderId: orderId), as: DeliveryStatusResponse.self)

        let (orderRes, deliveryRes) = await (orderReq, deliveryReq)
        order = orderRes?.order
        delivery = deliveryRes?.delivery
        isLoading = false
    }
}

struct SummaryRow: View {
    let label: String
    let value: Double

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text("$\(value, specifier: "%.2f")")
        }
        .font(.subheadline)
    }
}

struct DeliveryStepperView: View {
    let currentStep: Int
    private let steps = ["Pending", "Assigned", "Picked Up", "En Route", "Delivered"]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(steps.enumerated()), id: \.offset) { idx, step in
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(idx <= currentStep ? Color.brandAmber : Color.gray.opacity(0.3))
                            .frame(width: 24, height: 24)
                        if idx < currentStep {
                            Image(systemName: "checkmark")
                                .font(.caption2.bold())
                                .foregroundStyle(.white)
                        } else if idx == currentStep {
                            Circle()
                                .fill(.white)
                                .frame(width: 8, height: 8)
                        }
                    }
                    Text(step)
                        .font(.system(size: 9))
                        .foregroundStyle(idx <= currentStep ? .primary : .secondary)
                }
                .frame(maxWidth: .infinity)

                if idx < steps.count - 1 {
                    Rectangle()
                        .fill(idx < currentStep ? Color.brandAmber : Color.gray.opacity(0.3))
                        .frame(height: 2)
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, 16)
                }
            }
        }
    }
}
