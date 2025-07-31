# Access RGB channels
red_only = input | pixel_op((p) => (p.r, 0, 0))
green_only = input | pixel_op((p) => (0, p.g, 0))
blue_only = input | pixel_op((p) => (0, 0, p.b))

# Channel swapping
bgr = input | pixel_op((p) => (p.b, p.g, p.r))

# Luminance calculation
luminance = input | pixel_op((p) => p.r * 0.2126 + p.g * 0.7152 + p.b * 0.0722)