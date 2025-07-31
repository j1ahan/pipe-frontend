# Simple pipeline
result = input | grayscale | gaussian_blur(3) | threshold(0.5)

# Multi-step edge detection
edges = input | grayscale | gaussian_blur(2) | sobel | threshold(0.1)