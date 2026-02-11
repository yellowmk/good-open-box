import SwiftUI
import GOBShared

struct DriverApplyView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var vehicleType = "car"
    @State private var vehicleYear = ""
    @State private var vehicleMake = ""
    @State private var vehicleModel = ""
    @State private var licenseNumber = ""
    @State private var licenseState = ""
    @State private var isSubmitting = false
    @State private var error: String?
    @State private var showSuccess = false

    private let vehicleTypes = ["car", "truck", "van", "suv", "motorcycle"]

    var body: some View {
        Form {
            Section("Personal Info") {
                TextField("Full Name", text: $name)
                    .textContentType(.name)
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                TextField("Phone", text: $phone)
                    .textContentType(.telephoneNumber)
                    .keyboardType(.phonePad)
            }

            Section("Vehicle") {
                Picker("Type", selection: $vehicleType) {
                    ForEach(vehicleTypes, id: \.self) { type in
                        Text(type.capitalized).tag(type)
                    }
                }
                TextField("Year", text: $vehicleYear)
                    .keyboardType(.numberPad)
                TextField("Make", text: $vehicleMake)
                TextField("Model", text: $vehicleModel)
            }

            Section("License") {
                TextField("License Number", text: $licenseNumber)
                TextField("State", text: $licenseState)
                    .textContentType(.addressState)
            }

            if let error {
                Section { Text(error).foregroundStyle(.red) }
            }

            Section {
                Button {
                    Task { await submit() }
                } label: {
                    HStack {
                        Spacer()
                        if isSubmitting {
                            ProgressView()
                        } else {
                            Text("Submit Application")
                                .fontWeight(.semibold)
                        }
                        Spacer()
                    }
                }
                .disabled(!isFormValid || isSubmitting)
            }
        }
        .navigationTitle("Apply to Drive")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
        }
        .alert("Application Submitted!", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("We'll review your application and get back to you soon.")
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty && !email.isEmpty && !phone.isEmpty && !licenseNumber.isEmpty && !licenseState.isEmpty
    }

    private func submit() async {
        isSubmitting = true
        error = nil
        var data: [String: Any] = [
            "name": name, "email": email, "phone": phone,
            "vehicleType": vehicleType,
            "licenseNumber": licenseNumber, "licenseState": licenseState
        ]
        if let year = Int(vehicleYear) { data["vehicleYear"] = year }
        if !vehicleMake.isEmpty { data["vehicleMake"] = vehicleMake }
        if !vehicleModel.isEmpty { data["vehicleModel"] = vehicleModel }

        do {
            let response = try await APIClient.shared.request(
                .driverApply(data: data),
                as: DriverApplicationResponse.self
            )
            if response.success {
                showSuccess = true
            } else {
                error = response.message ?? "Application failed"
            }
        } catch let apiErr as APIError {
            error = apiErr.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }
        isSubmitting = false
    }
}
