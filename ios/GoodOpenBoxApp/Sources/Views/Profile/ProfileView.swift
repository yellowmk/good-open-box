import SwiftUI
import GOBShared

struct ProfileView: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        List {
            if let user = auth.currentUser {
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Color.brandAmber)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.name)
                                .font(.title3.bold())
                            Text(user.email)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text(user.role.capitalized)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.brandAmber.opacity(0.15))
                                .foregroundStyle(Color.brandAmberDark)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    NavigationLink(destination: OrderListView()) {
                        Label("My Orders", systemImage: "shippingbox.fill")
                    }
                }

                Section("Legal") {
                    NavigationLink(destination: LegalPoliciesView()) {
                        Label("Legal Policies", systemImage: "doc.text.fill")
                    }
                }

                Section {
                    Button(role: .destructive) {
                        Task { await auth.logout() }
                    } label: {
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
        }
        .navigationTitle("Profile")
    }
}
