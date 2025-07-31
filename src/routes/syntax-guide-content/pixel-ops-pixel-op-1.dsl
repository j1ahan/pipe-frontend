# Apply operation to each pixel
brightened = input | pixel_op((p) => p * 1.5)
darkened = input | pixel_op((p) => p * 0.5)

# Clamp values
clamped = input | pixel_op((p) => min(max(p, 0.0), 1.0))