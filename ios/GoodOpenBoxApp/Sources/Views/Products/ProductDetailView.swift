import SwiftUI
import GOBShared

struct ProductDetailView: View {
    let productId: String
    @Environment(CartViewModel.self) private var cart
    @State private var product: Product?
    @State private var recommendations: [Product] = []
    @State private var recommendationExplanation: String?
    @State private var selectedImageIndex = 0
    @State private var isLoading = true
    @State private var addedToCart = false

    var body: some View {
        ScrollView {
            if let product {
                VStack(alignment: .leading, spacing: 0) {
                    // Image gallery
                    TabView(selection: $selectedImageIndex) {
                        ForEach(Array(product.images.enumerated()), id: \.offset) { idx, url in
                            AsyncImage(url: URL(string: url)) { phase in
                                switch phase {
                                case .success(let img):
                                    img.resizable().scaledToFit()
                                case .failure:
                                    Image(systemName: "photo")
                                        .font(.system(size: 60))
                                        .foregroundStyle(.secondary)
                                default:
                                    ProgressView()
                                }
                            }
                            .tag(idx)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .automatic))
                    .frame(height: 300)
                    .background(Color.white)

                    VStack(alignment: .leading, spacing: 16) {
                        // Condition badge
                        Text(product.condition.replacingOccurrences(of: "-", with: " ").capitalized)
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.brandTeal.opacity(0.1))
                            .foregroundStyle(Color.brandTeal)
                            .clipShape(Capsule())

                        // Name
                        Text(product.name)
                            .font(.title2.bold())

                        // Price
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text("$\(product.price, specifier: "%.2f")")
                                .font(.title.bold())
                                .foregroundStyle(Color.brandAmber)

                            if let compare = product.compareAtPrice {
                                Text("$\(compare, specifier: "%.2f")")
                                    .font(.subheadline)
                                    .strikethrough()
                                    .foregroundStyle(.secondary)

                                if let pct = product.discountPercent {
                                    Text("\(pct)% off")
                                        .font(.caption.bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 2)
                                        .background(Color.red.opacity(0.1))
                                        .foregroundStyle(.red)
                                        .clipShape(Capsule())
                                }
                            }
                        }

                        // Brand & category
                        if let brand = product.brand {
                            HStack {
                                Label(brand, systemImage: "tag.fill")
                                Spacer()
                                Label(product.category, systemImage: "folder.fill")
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        }

                        // Rating
                        if let rating = product.rating {
                            HStack(spacing: 4) {
                                ForEach(0..<5) { i in
                                    Image(systemName: i < Int(rating) ? "star.fill" : "star")
                                        .foregroundStyle(Color.brandAmber)
                                        .font(.caption)
                                }
                                if let count = product.numReviews {
                                    Text("(\(count))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }

                        // Stock
                        HStack {
                            Image(systemName: product.stock > 0 ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundStyle(product.stock > 0 ? .green : .red)
                            Text(product.stock > 0 ? "In Stock (\(product.stock))" : "Out of Stock")
                                .font(.subheadline)
                        }

                        Divider()

                        // Description
                        Text("Description")
                            .font(.headline)
                        Text(product.description)
                            .font(.body)
                            .foregroundStyle(.secondary)

                        // Add to Cart
                        Button {
                            cart.addToCart(product)
                            addedToCart = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                addedToCart = false
                            }
                        } label: {
                            HStack {
                                Image(systemName: addedToCart ? "checkmark" : "cart.badge.plus")
                                Text(addedToCart ? "Added!" : "Add to Cart")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(addedToCart ? .green : Color.brandAmber)
                        .controlSize(.large)
                        .disabled(product.stock <= 0)

                        // AI Recommendations
                        if !recommendations.isEmpty {
                            Divider()
                            VStack(alignment: .leading, spacing: 12) {
                                Text("You Might Also Like")
                                    .font(.headline)
                                if let explanation = recommendationExplanation {
                                    Text(explanation)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 12) {
                                        ForEach(recommendations) { rec in
                                            NavigationLink(destination: ProductDetailView(productId: rec.id)) {
                                                ProductCard(product: rec)
                                                    .frame(width: 160)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .padding(16)
                }
            }
        }
        .background(Color.pageBackground)
        .navigationBarTitleDisplayMode(.inline)
        .overlay {
            if isLoading { ProgressView() }
        }
        .task { await loadProduct() }
    }

    private func loadProduct() async {
        isLoading = true
        do {
            let response = try await APIClient.shared.request(.productDetail(id: productId), as: ProductDetailResponse.self)
            product = response.product
        } catch {}
        isLoading = false

        // Load recommendations in background
        if let recResponse = try? await APIClient.shared.request(.aiRecommendations(productId: productId), as: AIRecommendationsResponse.self) {
            recommendations = recResponse.products ?? []
            recommendationExplanation = recResponse.explanation
        }
    }
}
