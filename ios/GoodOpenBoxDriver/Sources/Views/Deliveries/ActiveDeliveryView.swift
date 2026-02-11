import SwiftUI
import MapKit
import GOBShared

struct ActiveDeliveryView: View {
    @State var delivery: Delivery
    @State private var notes = ""
    @State private var isUpdating = false
    @State private var error: String?

    private var nextStatus: String? {
        switch delivery.status {
        case "assigned", "claimed": return "picked_up"
        case "picked_up": return "en_route"
        case "en_route": return "delivered"
        default: return nil
        }
    }

    private var nextStatusLabel: String {
        switch nextStatus {
        case "picked_up": return "Mark as Picked Up"
        case "en_route": return "Mark as En Route"
        case "delivered": return "Mark as Delivered"
        default: return ""
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Status stepper
                VStack(alignment: .leading, spacing: 12) {
                    Text("Delivery Status")
                        .font(.headline)
                    DriverDeliveryStepperView(currentStep: delivery.statusStep)
                }
                .padding()
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Order info
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Order \(delivery.orderId)")
                            .font(.headline)
                        Spacer()
                        Text(String(format: "$%.2f", delivery.deliveryFee))
                            .font(.title3.bold())
                            .foregroundStyle(Color.driverAmber)
                    }
                }
                .padding()
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Addresses
                if let pickup = delivery.pickupAddress {
                    AddressCard(title: "Pickup", address: pickup, icon: "arrow.up.circle.fill", color: .blue)
                }
                if let dropoff = delivery.deliveryAddress {
                    AddressCard(title: "Delivery", address: dropoff, icon: "arrow.down.circle.fill", color: .green) {
                        navigateToAddress(dropoff)
                    }
                }

                // Notes
                if delivery.status != "delivered" {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Driver Notes")
                            .font(.headline)
                        TextField("Add notes (optional)...", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                            .padding()
                            .background(.regularMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }

                if let error {
                    Text(error).foregroundStyle(.red).font(.callout)
                }

                // Action button
                if let next = nextStatus {
                    Button {
                        Task { await updateStatus(to: next) }
                    } label: {
                        HStack {
                            Spacer()
                            if isUpdating {
                                ProgressView()
                            } else {
                                Label(nextStatusLabel, systemImage: "arrow.right.circle.fill")
                                    .fontWeight(.semibold)
                            }
                            Spacer()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.driverAmber)
                    .controlSize(.large)
                    .disabled(isUpdating)
                }

                if delivery.status == "delivered" {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 48))
                                .foregroundStyle(.green)
                            Text("Delivery Complete!")
                                .font(.headline)
                        }
                        Spacer()
                    }
                    .padding()
                }
            }
            .padding()
        }
        .background(Color.driverPageBg)
        .navigationTitle("Delivery #\(delivery.id)")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func updateStatus(to status: String) async {
        isUpdating = true
        error = nil
        do {
            let response = try await APIClient.shared.request(
                .updateDeliveryStatus(id: delivery.id, status: status, notes: notes.isEmpty ? nil : notes),
                as: DeliveryDetailResponse.self
            )
            delivery = response.delivery
        } catch let apiErr as APIError {
            error = apiErr.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }
        isUpdating = false
    }

    private func navigateToAddress(_ address: ShippingAddress) {
        let geocoder = CLGeocoder()
        let addressString = address.formatted
        geocoder.geocodeAddressString(addressString) { placemarks, _ in
            if let placemark = placemarks?.first, let location = placemark.location {
                let mapItem = MKMapItem(placemark: MKPlacemark(coordinate: location.coordinate))
                mapItem.name = "Delivery Address"
                mapItem.openInMaps(launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving])
            }
        }
    }
}

struct AddressCard: View {
    let title: String
    let address: ShippingAddress
    let icon: String
    let color: Color
    var onNavigate: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.headline)
                    .foregroundStyle(color)
                Spacer()
                if let onNavigate {
                    Button { onNavigate() } label: {
                        Label("Navigate", systemImage: "location.fill")
                            .font(.caption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .tint(color)
                }
            }
            Text(address.formatted)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct DriverDeliveryStepperView: View {
    let currentStep: Int
    private let steps = ["Claimed", "Picked Up", "En Route", "Delivered"]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(steps.enumerated()), id: \.offset) { idx, step in
                let adjustedIdx = idx + 1 // steps start at 1 for driver
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(adjustedIdx <= currentStep ? Color.driverAmber : Color.gray.opacity(0.3))
                            .frame(width: 28, height: 28)
                        if adjustedIdx < currentStep {
                            Image(systemName: "checkmark")
                                .font(.caption2.bold())
                                .foregroundStyle(.white)
                        } else if adjustedIdx == currentStep {
                            Circle()
                                .fill(.white)
                                .frame(width: 10, height: 10)
                        }
                    }
                    Text(step)
                        .font(.system(size: 10))
                        .foregroundStyle(adjustedIdx <= currentStep ? .primary : .secondary)
                }
                .frame(maxWidth: .infinity)

                if idx < steps.count - 1 {
                    Rectangle()
                        .fill(adjustedIdx < currentStep ? Color.driverAmber : Color.gray.opacity(0.3))
                        .frame(height: 2)
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, 16)
                }
            }
        }
    }
}
