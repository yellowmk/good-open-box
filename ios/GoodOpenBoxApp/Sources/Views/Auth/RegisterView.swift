import SwiftUI
import GOBShared

struct RegisterView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""

    private var passwordsMatch: Bool { password == confirmPassword }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    AsyncImage(url: URL(string: "https://goodobox.com/logo-icon.png")) { phase in
                        if let img = phase.image {
                            img.resizable().scaledToFit()
                        } else {
                            Image(systemName: "person.badge.plus")
                                .font(.system(size: 48))
                                .foregroundStyle(Color.brandAmber)
                        }
                    }
                    .frame(width: 80, height: 80)
                    Text("Create Account")
                        .font(.title.bold())
                }
                .padding(.top, 24)

                VStack(spacing: 16) {
                    TextField("Full Name", text: $name)
                        .textContentType(.name)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    SecureField("Password", text: $password)
                        .textContentType(.newPassword)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    SecureField("Confirm Password", text: $confirmPassword)
                        .textContentType(.newPassword)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    if !confirmPassword.isEmpty && !passwordsMatch {
                        Text("Passwords don't match")
                            .foregroundStyle(.red)
                            .font(.caption)
                    }
                }

                if let error = auth.error {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.callout)
                }

                Button {
                    Task {
                        try? await auth.register(name: name, email: email, password: password)
                        if auth.isAuthenticated { dismiss() }
                    }
                } label: {
                    if auth.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Create Account")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.brandAmber)
                .controlSize(.large)
                .disabled(name.isEmpty || email.isEmpty || password.isEmpty || !passwordsMatch || auth.isLoading)
            }
            .padding(.horizontal, 24)
        }
        .navigationTitle("Register")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
        }
    }
}
