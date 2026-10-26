import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : FileManager.default.currentDirectoryPath)
let folder = root.appendingPathComponent("ios/BilgiEdu2/Images.xcassets/AppIcon.appiconset")
let sizes: [(String, String, String, Int)] = [
  ("iphone", "20x20", "2x", 40), ("iphone", "20x20", "3x", 60),
  ("iphone", "29x29", "2x", 58), ("iphone", "29x29", "3x", 87),
  ("iphone", "40x40", "2x", 80), ("iphone", "40x40", "3x", 120),
  ("iphone", "60x60", "2x", 120), ("iphone", "60x60", "3x", 180),
  ("ipad", "20x20", "1x", 20), ("ipad", "20x20", "2x", 40),
  ("ipad", "29x29", "1x", 29), ("ipad", "29x29", "2x", 58),
  ("ipad", "40x40", "1x", 40), ("ipad", "40x40", "2x", 80),
  ("ipad", "76x76", "1x", 76), ("ipad", "76x76", "2x", 152),
  ("ipad", "83.5x83.5", "2x", 167), ("ios-marketing", "1024x1024", "1x", 1024)
]
try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
var entries: [[String: String]] = []
for (idiom, size, scale, pixels) in sizes {
  let name = "AppIcon-\(pixels).png"
  guard let context = CGContext(data: nil, width: pixels, height: pixels, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fatalError("Cannot create icon context") }
  context.scaleBy(x: CGFloat(pixels) / 1024, y: CGFloat(pixels) / 1024)
  context.translateBy(x: 0, y: 1024)
  context.scaleBy(x: 1, y: -1)
  context.setFillColor(CGColor(red: 119/255, green: 96/255, blue: 218/255, alpha: 1))
  context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
  context.setLineCap(.round)
  context.setLineJoin(.round)
  context.setLineWidth(64)
  context.setStrokeColor(CGColor(red: 248/255, green: 247/255, blue: 243/255, alpha: 1))
  context.move(to: CGPoint(x: 272, y: 320))
  context.addLine(to: CGPoint(x: 272, y: 638))
  context.addQuadCurve(to: CGPoint(x: 366, y: 732), control: CGPoint(x: 272, y: 732))
  context.addLine(to: CGPoint(x: 630, y: 732))
  context.addQuadCurve(to: CGPoint(x: 724, y: 638), control: CGPoint(x: 724, y: 732))
  context.addLine(to: CGPoint(x: 724, y: 286))
  context.strokePath()
  context.move(to: CGPoint(x: 622, y: 388))
  context.addLine(to: CGPoint(x: 724, y: 286))
  context.addLine(to: CGPoint(x: 826, y: 388))
  context.strokePath()
  context.setLineWidth(42)
  context.setStrokeColor(CGColor(red: 236/255, green: 188/255, blue: 151/255, alpha: 1))
  context.move(to: CGPoint(x: 414, y: 480))
  context.addLine(to: CGPoint(x: 552, y: 480))
  context.move(to: CGPoint(x: 496, y: 424))
  context.addLine(to: CGPoint(x: 552, y: 480))
  context.addLine(to: CGPoint(x: 496, y: 536))
  context.strokePath()
  guard let image = context.makeImage(), let destination = CGImageDestinationCreateWithURL(folder.appendingPathComponent(name) as CFURL, UTType.png.identifier as CFString, 1, nil) else { fatalError("Cannot export icon") }
  CGImageDestinationAddImage(destination, image, nil)
  guard CGImageDestinationFinalize(destination) else { fatalError("Cannot finalize icon") }
  entries.append(["idiom": idiom, "size": size, "scale": scale, "filename": name])
}
let contents: [String: Any] = ["images": entries, "info": ["author": "xcode", "version": 1]]
try JSONSerialization.data(withJSONObject: contents, options: [.prettyPrinted, .sortedKeys]).write(to: folder.appendingPathComponent("Contents.json"))
print("Generated opaque app icons for iPhone, iPad and App Store.")
