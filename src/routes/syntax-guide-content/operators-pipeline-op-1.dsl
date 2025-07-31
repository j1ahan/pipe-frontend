# Single operation
gray = input | grayscale

# Multiple operations
processed = input | grayscale | gaussian_blur(5) | threshold(0.5)

# Assign intermediate results
temp = input | bilateral_filter(5.0, 10.0)
edges = temp | sobel
final = edges | threshold(0.1)