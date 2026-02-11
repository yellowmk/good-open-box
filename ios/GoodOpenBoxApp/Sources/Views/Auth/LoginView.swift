import SwiftUI
import GOBShared

struct LoginView: View {
    @Environment(AuthManager.self) private var auth
    @State private var email = ""
    @State private var password = ""
    @State private var showRegister = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Image(systemName: "shippingbox.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(Color.brandAmber)
                    Text("Good Open Box")
                        .font(.title.bold())
                    Text("Sign in to your account")
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 40)

                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                if let error = auth.error {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.callout)
                }

                Button {
                    Task {
                        try? await auth.login(email: email, password: password)
                    }
                } label: {
                    if auth.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.brandAmber)
                .controlSize(.large)
                .disabled(email.isEmpty || password.isEmpty || auth.isLoading)

                Button("Don't have an account? Register") {
                    showRegister = true
                }
                .foregroundStyle(Color.brandAmber)
            }
            .padding(.horizontal, 24)
        }
        .navigationTitle("Sign In")
        .sheet(isPresented: $showRegister) {
            NavigationStack {
                RegisterView()
            }
        }
    }
}
