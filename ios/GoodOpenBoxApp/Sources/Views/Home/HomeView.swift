import SwiftUI
import GOBShared

struct HomeView: View {
    @State private var featured: [Product] = []
    @State private var deals: [Product] = []
    @State private var categories: [Category] = []
    @State private var isLoading = true
    @State private var showChat = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Hero
                ZStack {
                    Color.brandTeal
                    VStack(spacing: 12) {
                        Text("Open Box Deals")
                            .font(.largeTitle.bold())
                            .foregroundStyle(.white)
                        Text("Premium products at unbeatable prices")
                            .foregroundStyle(.white.opacity(0.9))
                        NavigationLink(destination: ProductListView()) {
                            Text("Shop Now")
                                .fontWeight(.semibold)
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(Color.brandAmber)
                                .foregroundStyle(.black)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.vertical, 32)
                }

                VStack(spacing: 24) {
                    // Categories
                    if !categories.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Categories")
                                .font(.title2.bold())
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(categories) { cat in
                                        NavigationLink(destination: ProductListView(initialCategory: cat.name)) {
                                            CategoryCard(name: cat.name)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Featured
                    if !featured.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Featured Products")
                                .font(.title2.bold())
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(featured) { product in
                                        NavigationLink(destination: ProductDetailView(productId: product.id)) {
                                            ProductCard(product: product)
                                                .frame(width: 180)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Deals
                    if !deals.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Best Deals")
                                    .font(.title2.bold())
                                Spacer()
                                NavigationLink("See All", destination: ProductListView(initialSort: "price_asc"))
                                    .foregroundStyle(Color.brandAmber)
                            }
                            .padding(.horizontal)

                            LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                                ForEach(deals) { product in
                                    NavigationLink(destination: ProductDetailView(productId: product.id)) {
                                        ProductCard(product: product)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical, 24)
            }
        }
        .background(Color.pageBackground)
        .navigationTitle("Good Open Box")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showChat = true } label: {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                }
            }
        }
        .sheet(isPresented: $showChat) {
            NavigationStack { ChatView() }
        }
        .overlay {
            if isLoading {
                ProgressView()
            }
        }
        .task { await loadData() }
    }

    private func loadData() async {
        isLoading = true
        async let f = try? APIClient.shared.request(.featuredProducts, as: ProductListResponse.self)
        async let d = try? APIClient.shared.request(.products(category: nil, condition: nil, search: nil, sort: "price_asc", minPrice: nil, maxPrice: nil, page: 1, limit: 8), as: ProductListResponse.self)
        async let c = try? APIClient.shared.request(.categories, as: CategoryListResponse.self)

        let (featuredRes, dealsRes, catRes) = await (f, d, c)
        featured = featuredRes?.products ?? []
        deals = dealsRes?.products ?? []
        categories = catRes?.categories ?? []
        isLoading = false
    }
}

struct CategoryCard: View {
    let name: String

    private var icon: String {
        switch name.lowercased() {
        case let n where n.contains("electronic"): return "desktopcomputer"
        case let n where n.contains("kitchen") || n.contains("appliance"): return "refrigerator.fill"
        case let n where n.contains("audio"): return "headphones"
        case let n where n.contains("gaming"): return "gamecontroller.fill"
        case let n where n.contains("phone") || n.contains("mobile"): return "iphone"
        case let n where n.contains("computer") || n.contains("laptop"): return "laptopcomputer"
        case let n where n.contains("camera"): return "camera.fill"
        case let n where n.contains("wearable") || n.contains("watch"): return "applewatch"
        case let n where n.contains("home"): return "house.fill"
        case let n where n.contains("office"): return "printer.fill"
        default: return "tag.fill"
        }
    }

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .frame(width: 48, height: 48)
                .background(Color.brandAmber.opacity(0.15))
                .clipShape(Circle())
            Text(name)
                .font(.caption)
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .frame(width: 80)
        .foregroundStyle(.primary)
    }
}

struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: product.firstImageURL) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().scaledToFill()
                case .failure:
                    Image(systemName: "photo").font(.largeTitle).foregroundStyle(.secondary)
                default:
                    ProgressView()
                }
            }
            .frame(height: 140)
            .frame(maxWidth: .infinity)
            .clipped()
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.subheadline)
                    .lineLimit(2)

                HStack(spacing: 4) {
                    Text("$\(product.price, specifier: "%.2f")")
                        .font(.subheadline.bold())
                        .foregroundStyle(Color.brandAmber)

                    if let compare = product.compareAtPrice {
                        Text("$\(compare, specifier: "%.2f")")
                            .font(.caption)
                            .strikethrough()
                            .foregroundStyle(.secondary)
                    }
                }

                Text(product.condition.replacingOccurrences(of: "-", with: " ").capitalized)
                    .font(.caption2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.brandTeal.opacity(0.1))
                    .foregroundStyle(Color.brandTeal)
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 4)
        }
        .padding(8)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
    }
}
