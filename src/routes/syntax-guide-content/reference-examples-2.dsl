# Load image
input = load_image("photo.jpg")

# Basic enhancement
enhanced_basic = input | contrast(1.3) | brightness(0.1)

# Advanced enhancement with noise reduction
enhanced_advanced = input | 
  bilateral_filter(5.0, 10.0) |
  contrast(1.2) |
  brightness(0.05) |
  pixel_op((p) => (
    min(p.r, 1.0),
    min(p.g, 1.0),
    min(p.b, 1.0)
  ))

# Selective enhancement
mask = input | grayscale | threshold(0.5)
selective = input | pixel_op((p) => 
  if mask > 0.5 then p * 1.2 else p
)