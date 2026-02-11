// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GOBShared",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "GOBShared", targets: ["GOBShared"])
    ],
    targets: [
        .target(name: "GOBShared")
    ]
)
