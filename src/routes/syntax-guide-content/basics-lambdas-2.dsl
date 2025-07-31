# Custom grayscale conversion
custom_gray = input | pixel_op((p) => p.r * 0.299 + p.g * 0.587 + p.b * 0.114)

# Invert image
inverted = input | pixel_op((p) => 1.0 - p)

# Custom threshold
binary = input | pixel_op((p) => if p > 0.5 then 1.0 else 0.0)