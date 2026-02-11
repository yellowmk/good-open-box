import SwiftUI
import SafariServices
import GOBShared

struct StripeOnboardingView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var stripeURL: String?
    @State private var isLoading = true
    @State private var error: String?
    @State private var showSafari = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if isLoading {
                    ProgressView("Setting up Stripe...")
                } else if let error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.orange)
                        Text(error)
                            .multilineTextAlignment(.center)
                        Button("Try Again") {
                            Task { await loadOnboardURL() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.driverAmber)
                    }
                } else if stripeURL != nil {
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.green)
                        Text("Stripe setup ready")
                            .font(.headline)
                        Button("Open Stripe Setup") {
                            showSafari = true
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.driverAmber)
                        .controlSize(.large)
                    }
                }
            }
            .padding()
            .navigationTitle("Stripe Setup")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .task { await loadOnboardURL() }
            .sheet(isPresented: $showSafari) {
                if let url = stripeURL {
                    StripeDriverSafariView(url: url) {
                        showSafari = false
                        dismiss()
                    }
                }
            }
        }
    }

    private func loadOnboardURL() async {
        isLoading = true
        error = nil
        do {
            let response = try await APIClient.shared.request(.driverStripeOnboard, as: StripeOnboardResponse.self)
            if response.success, let url = response.url {
                stripeURL = url
            } else {
                error = response.message ?? "Failed to get Stripe setup URL"
            }
        } catch let apiErr as APIError {
            error = apiErr.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

struct StripeDriverSafariView: UIViewControllerRepresentable {
    let url: String
    let onDismiss: () -> Void

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let vc = SFSafariViewController(url: URL(string: url)!)
        vc.preferredControlTintColor = UIColor(Color.driverAmber)
        vc.delegate = context.coordinator
        return vc
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onDismiss: onDismiss)
    }

    class Coordinator: NSObject, SFSafariViewControllerDelegate {
        let onDismiss: () -> Void
        init(onDismiss: @escaping () -> Void) { self.onDismiss = onDismiss }
        func safariViewControllerDidFinish(_ controller: SFSafariViewController) { onDismiss() }
    }
}
