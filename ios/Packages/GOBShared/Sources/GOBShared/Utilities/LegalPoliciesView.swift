import SwiftUI

// MARK: - Legal Policies List

public struct LegalPoliciesView: View {
    public init() {}

    public var body: some View {
        List {
            Section {
                NavigationLink(destination: PrivacyPolicyView()) {
                    Label("Privacy Policy", systemImage: "lock.shield.fill")
                }
                NavigationLink(destination: TermsOfServiceView()) {
                    Label("Terms of Service", systemImage: "doc.text.fill")
                }
                NavigationLink(destination: ReturnRefundPolicyView()) {
                    Label("Return & Refund Policy", systemImage: "arrow.uturn.left.circle.fill")
                }
                NavigationLink(destination: ShippingDeliveryPolicyView()) {
                    Label("Shipping & Delivery Policy", systemImage: "shippingbox.fill")
                }
            } footer: {
                Text("Last updated February 2026")
                    .font(.caption2)
            }
        }
        .navigationTitle("Legal")
    }
}

// MARK: - Privacy Policy

public struct PrivacyPolicyView: View {
    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("""
                Effective Date: February 1, 2026

                Good Open Box ("we," "us," or "our") operates the Good Open Box mobile application and website (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                """)

                PolicySection(title: "1. Information We Collect") {
                    Text("""
                    Personal Information: When you create an account, we collect your name, email address, and password (stored securely using industry-standard hashing).

                    Payment Information: Payment processing is handled by Stripe, Inc. We do not store your full credit card number, expiration date, or CVV on our servers. Stripe's privacy policy governs the collection and use of your payment data.

                    Order Information: We collect details about your purchases, including items ordered, shipping address, order history, and transaction amounts.

                    Device Information: We may collect device type, operating system version, unique device identifiers, and push notification tokens.

                    Usage Data: We collect information about how you interact with the Service, including pages viewed, search queries, and features used.
                    """)
                }

                PolicySection(title: "2. How We Use Your Information") {
                    Text("""
                    We use your information to:

                    \u{2022} Process and fulfill your orders
                    \u{2022} Create and manage your account
                    \u{2022} Send order confirmations and delivery updates
                    \u{2022} Provide customer support
                    \u{2022} Improve and personalize the Service
                    \u{2022} Detect and prevent fraud
                    \u{2022} Comply with legal obligations
                    """)
                }

                PolicySection(title: "3. Third-Party Services") {
                    Text("""
                    We share information with the following third-party service providers:

                    Stripe: Payment processing. Stripe collects and processes payment information in accordance with their privacy policy (https://stripe.com/privacy).

                    Delivery Partners: Your name, address, and order details are shared with delivery drivers to fulfill your orders.

                    We do not sell your personal information to third parties.
                    """)
                }

                PolicySection(title: "4. Data Security") {
                    Text("""
                    We implement reasonable security measures to protect your personal information, including encrypted data transmission (HTTPS/TLS), secure password hashing, and access controls. However, no method of electronic transmission or storage is 100% secure.
                    """)
                }

                PolicySection(title: "5. Data Retention") {
                    Text("""
                    We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us.
                    """)
                }

                PolicySection(title: "6. Your Rights") {
                    Text("""
                    Depending on your location, you may have the following rights:

                    \u{2022} Access: Request a copy of the personal data we hold about you.
                    \u{2022} Correction: Request correction of inaccurate data.
                    \u{2022} Deletion: Request deletion of your personal data.
                    \u{2022} Portability: Request your data in a portable format.
                    \u{2022} Opt-Out: Opt out of marketing communications at any time.

                    California residents (CCPA): You have the right to know what personal information is collected, request deletion, and opt out of the sale of personal information. We do not sell personal information.

                    EU/EEA residents (GDPR): You have additional rights including the right to restrict processing and the right to lodge a complaint with a supervisory authority.

                    To exercise any of these rights, contact us at privacy@goodobox.com.
                    """)
                }

                PolicySection(title: "7. Children's Privacy") {
                    Text("""
                    The Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will delete it promptly.
                    """)
                }

                PolicySection(title: "8. Changes to This Policy") {
                    Text("""
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy within the app and updating the "Effective Date" above.
                    """)
                }

                PolicySection(title: "9. Contact Us") {
                    Text("""
                    If you have questions about this Privacy Policy, contact us at:

                    Email: privacy@goodobox.com
                    """)
                }
            }
            .padding()
        }
        .navigationTitle("Privacy Policy")
    }
}

// MARK: - Terms of Service

public struct TermsOfServiceView: View {
    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("""
                Effective Date: February 1, 2026

                Welcome to Good Open Box. By accessing or using our mobile application and website (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
                """)

                PolicySection(title: "1. Account Registration") {
                    Text("""
                    You must create an account to make purchases. You agree to:

                    \u{2022} Provide accurate and complete information
                    \u{2022} Maintain the security of your password
                    \u{2022} Accept responsibility for all activity under your account
                    \u{2022} Notify us immediately of any unauthorized use

                    You must be at least 18 years old to create an account. We reserve the right to suspend or terminate accounts that violate these Terms.
                    """)
                }

                PolicySection(title: "2. Open-Box Products") {
                    Text("""
                    Good Open Box specializes in open-box, returned, and refurbished products. By purchasing from us, you acknowledge that:

                    \u{2022} Products may have been previously opened, used, or returned
                    \u{2022} Products are inspected and graded by condition (Excellent, Good, Fair)
                    \u{2022} Original packaging may not be included or may show wear
                    \u{2022} Product descriptions and condition grades are provided in good faith but may not capture every cosmetic detail
                    \u{2022} All products are sold "as described" based on the listed condition grade
                    """)
                }

                PolicySection(title: "3. Pricing & Payment") {
                    Text("""
                    All prices are listed in US Dollars. Prices are subject to change without notice. Payment is processed securely through Stripe. You agree to pay all charges incurred under your account, including applicable taxes and shipping fees.

                    We reserve the right to cancel orders due to pricing errors, product unavailability, or suspected fraud.
                    """)
                }

                PolicySection(title: "4. Intellectual Property") {
                    Text("""
                    All content on the Service, including text, graphics, logos, and software, is the property of Good Open Box or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, or reproduce any content without our prior written consent.
                    """)
                }

                PolicySection(title: "5. Prohibited Conduct") {
                    Text("""
                    You agree not to:

                    \u{2022} Use the Service for any unlawful purpose
                    \u{2022} Attempt to gain unauthorized access to any part of the Service
                    \u{2022} Interfere with or disrupt the Service
                    \u{2022} Submit false or misleading information
                    \u{2022} Engage in fraudulent transactions or chargebacks
                    \u{2022} Resell products purchased through the Service in bulk without authorization
                    """)
                }

                PolicySection(title: "6. Limitation of Liability") {
                    Text("""
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, GOOD OPEN BOX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.

                    Our total liability for any claim arising from the Service shall not exceed the amount you paid for the specific product or service giving rise to the claim.
                    """)
                }

                PolicySection(title: "7. Disclaimer of Warranties") {
                    Text("""
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    """)
                }

                PolicySection(title: "8. Dispute Resolution") {
                    Text("""
                    Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive your right to a jury trial and to participate in class action lawsuits.

                    Notwithstanding the above, either party may seek injunctive relief in a court of competent jurisdiction.
                    """)
                }

                PolicySection(title: "9. Governing Law") {
                    Text("""
                    These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
                    """)
                }

                PolicySection(title: "10. Changes to Terms") {
                    Text("""
                    We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify you of material changes through the app or via email.
                    """)
                }

                PolicySection(title: "11. Contact Us") {
                    Text("""
                    If you have questions about these Terms, contact us at:

                    Email: support@goodobox.com
                    """)
                }
            }
            .padding()
        }
        .navigationTitle("Terms of Service")
    }
}

// MARK: - Return & Refund Policy

public struct ReturnRefundPolicyView: View {
    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("""
                Effective Date: February 1, 2026

                We want you to be satisfied with your purchase. If you are not completely happy, we offer returns and refunds subject to the following policy.
                """)

                PolicySection(title: "1. Return Window") {
                    Text("""
                    You may return most items within 30 days of delivery for a refund or exchange. To be eligible for a return, the item must be:

                    \u{2022} In the same condition as when you received it
                    \u{2022} In its original packaging (if applicable)
                    \u{2022} Accompanied by proof of purchase (order number or receipt)
                    """)
                }

                PolicySection(title: "2. Non-Returnable Items") {
                    Text("""
                    The following items cannot be returned:

                    \u{2022} Items marked as "Final Sale" or "Non-Returnable" on the product page
                    \u{2022} Items that have been further damaged, modified, or altered after delivery
                    \u{2022} Hygiene-sensitive products that have been opened or used
                    \u{2022} Gift cards
                    """)
                }

                PolicySection(title: "3. How to Initiate a Return") {
                    Text("""
                    To start a return:

                    1. Go to "My Orders" in the app
                    2. Select the order containing the item you wish to return
                    3. Tap "Request Return" and follow the prompts
                    4. You will receive a return shipping label via email

                    Alternatively, contact our support team at support@goodobox.com.
                    """)
                }

                PolicySection(title: "4. Return Shipping") {
                    Text("""
                    \u{2022} If the return is due to our error (wrong item, defective product, or item not as described), we will cover return shipping costs.
                    \u{2022} For all other returns, you are responsible for return shipping costs.
                    \u{2022} We recommend using a trackable shipping method.
                    """)
                }

                PolicySection(title: "5. Refund Process") {
                    Text("""
                    Once we receive and inspect your return:

                    \u{2022} We will notify you of the approval or rejection of your refund within 3 business days.
                    \u{2022} Approved refunds will be processed to your original payment method within 5-10 business days.
                    \u{2022} Shipping charges from the original order are non-refundable unless the return is due to our error.
                    """)
                }

                PolicySection(title: "6. Exchanges") {
                    Text("""
                    Due to the unique nature of open-box inventory, exchanges are subject to product availability. If the same item is not available, we will issue a full refund.
                    """)
                }

                PolicySection(title: "7. Damaged or Defective Items") {
                    Text("""
                    If you receive an item that is damaged during shipping or is defective beyond its listed condition grade, please contact us within 7 days of delivery. Include photos of the damage and we will arrange a return at no cost to you.
                    """)
                }

                PolicySection(title: "8. Contact Us") {
                    Text("""
                    For questions about returns or refunds, contact us at:

                    Email: support@goodobox.com
                    """)
                }
            }
            .padding()
        }
        .navigationTitle("Return & Refund Policy")
    }
}

// MARK: - Shipping & Delivery Policy

public struct ShippingDeliveryPolicyView: View {
    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("""
                Effective Date: February 1, 2026

                Good Open Box offers delivery for open-box and refurbished products. Please review our shipping and delivery terms below.
                """)

                PolicySection(title: "1. Service Areas") {
                    Text("""
                    We currently offer shipping and delivery within the contiguous United States. We do not ship to P.O. boxes, APO/FPO addresses, or international destinations at this time.

                    Local delivery may be available in select metropolitan areas, subject to availability.
                    """)
                }

                PolicySection(title: "2. Shipping Fees") {
                    Text("""
                    \u{2022} Standard Shipping: $\(String(format: "%.2f", Constants.shippingCost)) per order
                    \u{2022} Free Shipping: Orders over $\(String(format: "%.0f", Constants.freeShippingThreshold)) qualify for free standard shipping
                    \u{2022} Local Delivery: Fees vary by distance and are displayed at checkout

                    Shipping fees are non-refundable unless the return is due to our error.
                    """)
                }

                PolicySection(title: "3. Estimated Delivery Timeframes") {
                    Text("""
                    \u{2022} Standard Shipping: 5-7 business days
                    \u{2022} Local Delivery: 1-3 business days (where available)

                    Delivery times are estimates and are not guaranteed. Delays may occur due to weather, carrier issues, or high demand periods.
                    """)
                }

                PolicySection(title: "4. Order Processing") {
                    Text("""
                    Orders are typically processed within 1-2 business days. You will receive a confirmation email with tracking information once your order has shipped.

                    Orders placed after 2:00 PM PT or on weekends/holidays will be processed the next business day.
                    """)
                }

                PolicySection(title: "5. Delivery Confirmation") {
                    Text("""
                    All deliveries require confirmation. Depending on the carrier and delivery method:

                    \u{2022} Standard shipping deliveries may be left at your door or require a signature
                    \u{2022} Local deliveries include photo confirmation upon delivery
                    \u{2022} You will receive a notification when your order has been delivered
                    """)
                }

                PolicySection(title: "6. Missing or Lost Packages") {
                    Text("""
                    If your package has not arrived within the estimated delivery window, please:

                    1. Check the tracking information provided in your confirmation email
                    2. Check with neighbors or your building's package room
                    3. Contact us at support@goodobox.com if the package cannot be located

                    We will work with the carrier to resolve the issue and may issue a replacement or refund at our discretion.
                    """)
                }

                PolicySection(title: "7. Contact Us") {
                    Text("""
                    For shipping and delivery questions, contact us at:

                    Email: support@goodobox.com
                    """)
                }
            }
            .padding()
        }
        .navigationTitle("Shipping & Delivery")
    }
}

// MARK: - Helper Views

private struct PolicySection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
            content
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}
