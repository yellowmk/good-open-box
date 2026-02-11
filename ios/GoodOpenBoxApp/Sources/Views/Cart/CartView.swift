import SwiftUI
import GOBShared

struct CartView: View {
    @Environment(CartViewModel.self) private var cart
    @Environment(AuthManager.self) private var auth

    var body: some View {
        Group {
            if cart.items.isEmpty {
                ContentUnavailableView("Your Cart is Empty", systemImage: "cart", description: Text("Browse products and add items to your cart"))
            } else {
                List {
                    ForEach(cart.items) { item in
                        CartItemRow(item: item)
                    }
                    .onDelete { offsets in
                        for idx in offsets {
                            cart.removeFromCart(productId: cart.items[idx].product.id)
                        }
                    }

                    Section("Order Summary") {
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
                            if cart.shipping == 0 {
                                Text("FREE").foregroundStyle(.green)
                            } else {
                                Text("$\(cart.shipping, specifier: "%.2f")")
                            }
                        }
                        HStack {
                            Text("Total").fontWeight(.bold)
                            Spacer()
                            Text("$\(cart.total, specifier: "%.2f")")
                                .fontWeight(.bold)
                                .foregroundStyle(Color.brandAmber)
                        }
                    }

                    Section {
                        if auth.isAuthenticated {
                            NavigationLink(destination: CheckoutView()) {
                                HStack {
                                    Spacer()
                                    Label("Proceed to Checkout", systemImage: "creditcard.fill")
                                        .fontWeight(.semibold)
                                    Spacer()
                                }
                            }
                            .listRowBackground(Color.brandAmber)
                        } else {
                            NavigationLink(destination: LoginView()) {
                                Label("Sign in to Checkout", systemImage: "person.fill")
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Cart")
        .toolbar {
            if !cart.items.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Clear", role: .destructive) { cart.clear() }
                }
            }
        }
    }
}

struct CartItemRow: View {
    let item: CartItem
    @Environment(CartViewModel.self) private var cart

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: item.product.firstImageURL) { phase in
                if let img = phase.image {
                    img.resizable().scaledToFill()
                } else {
                    Color.gray.opacity(0.1)
                }
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(.subheadline)
                    .lineLimit(2)
                Text("$\(item.product.price, specifier: "%.2f")")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.brandAmber)

                Stepper("Qty: \(item.quantity)", value: .init(
                    get: { item.quantity },
                    set: { cart.updateQuantity(productId: item.product.id, quantity: $0) }
                ), in: 1...item.product.stock)
                .font(.caption)
            }
        }
        .padding(.vertical, 4)
    }
}
