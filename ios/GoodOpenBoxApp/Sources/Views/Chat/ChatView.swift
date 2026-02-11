import SwiftUI
import GOBShared

struct ChatView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var messages: [ChatMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @State private var suggestedProducts: [Product] = []

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        // Welcome message
                        if messages.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "bubble.left.and.bubble.right.fill")
                                    .font(.system(size: 36))
                                    .foregroundStyle(Color.brandAmber)
                                Text("Hi! I'm your shopping assistant.")
                                    .font(.headline)
                                Text("Ask me about products, deals, or get recommendations.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 40)
                        }

                        ForEach(messages) { msg in
                            ChatBubble(message: msg)
                        }

                        if isLoading {
                            HStack(spacing: 4) {
                                ForEach(0..<3, id: \.self) { i in
                                    Circle()
                                        .fill(Color.secondary)
                                        .frame(width: 8, height: 8)
                                        .opacity(0.5)
                                }
                            }
                            .padding(.horizontal)
                        }

                        // Suggested products
                        if !suggestedProducts.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(suggestedProducts) { product in
                                        NavigationLink(destination: ProductDetailView(productId: product.id)) {
                                            ProductCard(product: product)
                                                .frame(width: 150)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }

                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(.vertical)
                }
                .onChange(of: messages.count) {
                    withAnimation { proxy.scrollTo("bottom") }
                }
            }

            Divider()

            HStack(spacing: 12) {
                TextField("Ask about products...", text: $inputText)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { sendMessage() }

                Button { sendMessage() } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(inputText.isEmpty ? .secondary : Color.brandAmber)
                }
                .disabled(inputText.isEmpty || isLoading)
            }
            .padding()
        }
        .navigationTitle("Chat")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Done") { dismiss() }
            }
        }
    }

    private func sendMessage() {
        guard !inputText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let userMsg = ChatMessage(role: "user", content: inputText)
        messages.append(userMsg)
        inputText = ""
        isLoading = true

        Task {
            do {
                let response = try await APIClient.shared.request(
                    .aiChat(messages: messages),
                    as: AIChatResponse.self
                )
                if let reply = response.reply {
                    messages.append(ChatMessage(role: "assistant", content: reply))
                }
                if let updated = response.updatedMessages {
                    messages = updated
                }
                suggestedProducts = response.products ?? []
            } catch {
                messages.append(ChatMessage(role: "assistant", content: "Sorry, I couldn't process your request. Please try again."))
            }
            isLoading = false
        }
    }
}

struct ChatBubble: View {
    let message: ChatMessage

    private var isUser: Bool { message.role == "user" }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 60) }
            Text(message.content)
                .font(.body)
                .padding(12)
                .background(isUser ? Color.brandAmber : Color(.systemGray5))
                .foregroundStyle(isUser ? .black : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            if !isUser { Spacer(minLength: 60) }
        }
        .padding(.horizontal)
    }
}
