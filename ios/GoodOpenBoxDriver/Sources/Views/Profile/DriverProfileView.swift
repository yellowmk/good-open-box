import SwiftUI
import GOBShared

struct DriverProfileView: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        List {
            if let user = auth.currentUser {
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Color.driverAmber)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.name)
                                .font(.title3.bold())
                            Text(user.email)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text("Driver")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.driverAmber.opacity(0.15))
                                .foregroundStyle(Color.driverAmberDark)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    NavigationLink(destination: EarningsView()) {
                        Label("Earnings", systemImage: "dollarsign.circle.fill")
                    }
                    NavigationLink(destination: MyDeliveriesView()) {
                        Label("Delivery History", systemImage: "clock.fill")
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
