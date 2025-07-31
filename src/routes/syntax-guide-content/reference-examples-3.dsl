# Custom grayscale with different weights
custom_gray = input | pixel_op((p) => 
  p.r * 0.2126 + p.g * 0.7152 + p.b * 0.0722
)

# Sepia tone effect
sepia = input | pixel_op((p) => (
  min(p.r * 0.393 + p.g * 0.769 + p.b * 0.189, 1.0),
  min(p.r * 0.349 + p.g * 0.686 + p.b * 0.168, 1.0),
  min(p.r * 0.272 + p.g * 0.534 + p.b * 0.131, 1.0)
))

# Custom edge enhancement
sharpened = input | stencil_op(3, (center, neighbors) =>
  center * 2.0 - avg(neighbors)
)