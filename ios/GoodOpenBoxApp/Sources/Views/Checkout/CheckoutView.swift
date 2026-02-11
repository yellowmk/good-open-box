import SwiftUI
import GOBShared

struct CheckoutView: View {
    @Environment(CartViewModel.self) private var cart
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var street = ""
    @State private var city = ""
    @State private var state = ""
    @State private var zip = ""
    @State private var phone = ""
    @State private var deliveryFee: Double?
    @State private var isLoadingFee = false
    @State private var isSubmitting = false
    @State private var error: String?
    @State private var stripeURL: String?
    @State private var orderId: String?
    @State private var showStripe = false
    @State private var showConfirmation = false

    private var grandTotal: Double {
        cart.total + (deliveryFee ?? 0)
    }

    var body: some View {
        Form {
            Section("Shipping Address") {
                TextField("Full Name", text: $name)
                    .textContentType(.name)
                TextField("Street Address", text: $street)
                    .textContentType(.streetAddressLine1)
                TextField("City", text: $city)
                    .textContentType(.addressCity)
                HStack {
                    TextField("State", text: $state)
                        .textContentType(.addressState)
                    TextField("ZIP", text: $zip)
                        .textContentType(.postalCode)
                        .keyboardType(.numberPad)
                }
                TextField("Phone", text: $phone)
                    .textContentType(.telephoneNumber)
                    .keyboardType(.phonePad)
            }

            if !street.isEmpty && !city.isEmpty && !state.isEmpty && !zip.isEmpty {
                Section("Delivery Fee") {
                    if isLoadingFee {
                        HStack {
                            ProgressView()
                            Text("Calculating...")
                        }
                    } else if let fee = deliveryFee {
                        HStack {
                            Text("Delivery Fee")
                            Spacer()
                            Text("$\(fee, specifier: "%.2f")")
                        }
                    } else {
                        Button("Calculate Delivery Fee") {
                            Task { await calculateFee() }
                        }
                    }
                }
            }

            Section("Order Summary") {
                ForEach(cart.items) { item in
                    HStack {
                        Text("\(item.product.name) x\(item.quantity)")
                            .font(.subheadline)
                        Spacer()
                        Text("$\(item.lineTotal, specifier: "%.2f")")
                            .font(.subheadline)
                    }
                }

                HStack {
                    Text("Subtotal")
                    Spacer()
                    Text("$\(cart.subtotal, specifier: "%.2f")")
                }
                HStack {
                    Text("Tax")
                    Spacer()
                    Text("$\(cart.tax, specifier: "%.2f")")
                }
                HStack {
                    Text("Shipping")
                    Spacer()
                    Text(cart.shipping == 0 ? "FREE" : "$\(cart.shipping, specifier: "%.2f")")
                        .foregroundStyle(cart.shipping == 0 ? .green : .primary)
                }
                if let fee = deliveryFee {
                    HStack {
                        Text("Delivery")
                        Spacer()
                        Text("$\(fee, specifier: "%.2f")")
                    }
                }
                HStack {
                    Text("Total").fontWeight(.bold)
                    Spacer()
                    Text("$\(grandTotal, specifier: "%.2f")")
                        .fontWeight(.bold)
                        .foregroundStyle(Color.brandAmber)
                }
            }

            if let error {
                Section {
                    Text(error).foregroundStyle(.red)
                }
            }

            Section {
                Button {
                    Task { await checkout() }
                } label: {
                    HStack {
                        Spacer()
                        if isSubmitting {
                            ProgressView()
                        } else {
                            Label("Proceed to Payment", systemImage: "creditcard.fill")
                                .fontWeight(.semibold)
                        }
                        Spacer()
                    }
                }
                .disabled(!isFormValid || isSubmitting)
            }
        }
        .navigationTitle("Checkout")
        .sheet(isPresented: $showStripe) {
            if let url = stripeURL {
                StripeCheckoutView(url: url) {
                    showStripe = false
                    if let orderId {
                        Task { await pollForPayment(orderId: orderId) }
                    }
                }
            }
        }
        .alert("Order Confirmed!", isPresented: $showConfirmation) {
            Button("OK") {
                cart.clear()
                dismiss()
            }
        } message: {
            Text("Your payment was successful. You can track your order in the Orders tab.")
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty && !street.isEmpty && !city.isEmpty && !state.isEmpty && !zip.isEmpty
    }

    private func calculateFee() async {
        isLoadingFee = true
        if let response = try? await APIClient.shared.request(
            .deliveryFee(street: street, city: city, state: state, zip: zip),
            as: DeliveryFeeResponse.self
        ) {
            deliveryFee = response.fee
        }
        isLoadingFee = false
    }

    private func checkout() async {
        isSubmitting = true
        error = nil
        let address: [String: String] = [
            "name": name, "street": street, "city": city,
            "state": state, "zip": zip, "phone": phone
        ]
        do {
            let response = try await APIClient.shared.request(
                .checkoutSession(items: cart.checkoutItems, shippingAddress: address),
                as: CheckoutSessionResponse.self
            )
            if response.success, let url = response.sessionUrl {
                stripeURL = url
                orderId = response.orderId
                showStripe = true
            } else {
                error = response.message ?? "Failed to create checkout session"
            }
        } catch let apiErr as APIError {
            error = apiErr.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }
        isSubmitting = false
    }

    private func pollForPayment(orderId: String) async {
        for _ in 0..<15 {
            try? await Task.sleep(for: .seconds(2))
            if let response = try? await APIClient.shared.request(
                .orderDetail(id: orderId),
                as: OrderDetailResponse.self
            ), response.order.isPaid {
                showConfirmation = true
                return
            }
        }
        error = "Payment not yet confirmed. Check your Orders tab for updates."
    }
}
