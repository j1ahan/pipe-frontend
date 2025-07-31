# Access individual channels
red_channel = input | pixel_op((p) => p.r)
green_boost = input | pixel_op((p) => (p.r, p.g * 1.5, p.b))

# Channel mixing
sepia = input | pixel_op((p) => (
  p.r * 0.393 + p.g * 0.769 + p.b * 0.189,
  p.r * 0.349 + p.g * 0.686 + p.b * 0.168,
  p.r * 0.272 + p.g * 0.534 + p.b * 0.131
))