import SwiftUI
import GOBShared

struct ProductListView: View {
    var initialCategory: String? = nil
    var initialSort: String? = nil

    @State private var products: [Product] = []
    @State private var categories: [ProductCategory] = []
    @State private var searchText = ""
    @State private var selectedCategory: String? = nil
    @State private var selectedCondition: String? = nil
    @State private var selectedSort: String = "name"
    @State private var page = 1
    @State private var totalPages = 1
    @State private var isLoading = false
    @State private var showFilters = false

    private let conditions = ["open-box", "refurbished", "like-new", "used"]
    private let sortOptions = [
        ("name", "Name"),
        ("price_asc", "Price: Low to High"),
        ("price_desc", "Price: High to Low"),
        ("rating", "Rating")
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)
                TextField("Search products...", text: $searchText)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .onSubmit { resetAndLoad() }
                if !searchText.isEmpty {
                    Button { searchText = ""; resetAndLoad() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
                Button { showFilters = true } label: {
                    Image(systemName: "slider.horizontal.3")
                        .foregroundStyle(hasActiveFilters ? Color.brandAmber : .secondary)
                }
            }
            .padding(12)
            .background(.regularMaterial)

            // Active filters
            if hasActiveFilters {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        if let cat = selectedCategory {
                            FilterChip(label: cat) {
                                selectedCategory = nil
                                resetAndLoad()
                            }
                        }
                        if let cond = selectedCondition {
                            FilterChip(label: cond.capitalized) {
                                selectedCondition = nil
                                resetAndLoad()
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
            }

            // Product grid
            ScrollView {
                LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                    ForEach(products) { product in
                        NavigationLink(destination: ProductDetailView(productId: product.id)) {
                            ProductCard(product: product)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()

                if isLoading {
                    ProgressView().padding()
                }

                if page < totalPages && !isLoading {
                    Button("Load More") {
                        page += 1
                        Task { await loadProducts(append: true) }
                    }
                    .padding()
                }

                if products.isEmpty && !isLoading {
                    ContentUnavailableView("No Products Found", systemImage: "magnifyingglass", description: Text("Try adjusting your filters"))
                        .padding(.top, 40)
                }
            }
        }
        .background(Color.pageBackground)
        .navigationTitle("Products")
        .sheet(isPresented: $showFilters) {
            FilterSheet(
                categories: categories,
                selectedCategory: $selectedCategory,
                selectedCondition: $selectedCondition,
                selectedSort: $selectedSort,
                onApply: { resetAndLoad() }
            )
        }
        .task {
            if let cat = initialCategory { selectedCategory = cat }
            if let sort = initialSort { selectedSort = sort }
            await loadCategories()
            await loadProducts()
        }
    }

    private var hasActiveFilters: Bool {
        selectedCategory != nil || selectedCondition != nil
    }

    private func resetAndLoad() {
        page = 1
        products = []
        Task { await loadProducts() }
    }

    private func loadProducts(append: Bool = false) async {
        isLoading = true
        do {
            let response = try await APIClient.shared.request(
                .products(
                    category: selectedCategory,
                    condition: selectedCondition,
                    search: searchText.isEmpty ? nil : searchText,
                    sort: selectedSort,
                    minPrice: nil, maxPrice: nil,
                    page: page, limit: 20
                ),
                as: ProductListResponse.self
            )
            if append {
                products.append(contentsOf: response.products)
            } else {
                products = response.products
            }
            totalPages = response.pagination?.pages ?? 1
        } catch {}
        isLoading = false
    }

    private func loadCategories() async {
        let response = try? await APIClient.shared.request(.categories, as: CategoryListResponse.self)
        categories = response?.categories ?? []
    }
}

struct FilterChip: View {
    let label: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.caption)
            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.caption2)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.brandAmber.opacity(0.15))
        .foregroundStyle(Color.brandAmberDark)
        .clipShape(Capsule())
    }
}

struct FilterSheet: View {
    let categories: [ProductCategory]
    @Binding var selectedCategory: String?
    @Binding var selectedCondition: String?
    @Binding var selectedSort: String
    let onApply: () -> Void
    @Environment(\.dismiss) private var dismiss

    private let conditions = ["open-box", "refurbished", "like-new", "used"]
    private let sortOptions = [
        ("name", "Name"),
        ("price_asc", "Price: Low to High"),
        ("price_desc", "Price: High to Low"),
        ("rating", "Rating")
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Category") {
                    Picker("Category", selection: $selectedCategory) {
                        Text("All").tag(String?.none)
                        ForEach(categories) { cat in
                            Text(cat.name).tag(Optional(cat.name))
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Condition") {
                    Picker("Condition", selection: $selectedCondition) {
                        Text("All").tag(String?.none)
                        ForEach(conditions, id: \.self) { cond in
                            Text(cond.replacingOccurrences(of: "-", with: " ").capitalized)
                                .tag(Optional(cond))
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Sort By") {
                    Picker("Sort", selection: $selectedSort) {
                        ForEach(sortOptions, id: \.0) { opt in
                            Text(opt.1).tag(opt.0)
                        }
                    }
                    .pickerStyle(.menu)
                }
            }
            .navigationTitle("Filters")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Reset") {
                        selectedCategory = nil
                        selectedCondition = nil
                        selectedSort = "name"
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Apply") {
                        onApply()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .presentationDetents([.medium])
    }
}
