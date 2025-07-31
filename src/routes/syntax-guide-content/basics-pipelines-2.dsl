# Canny edge detection pipeline
edges = input | grayscale | gaussian_blur(5) | canny_edge(0.1, 0.3)

# Feature enhancement pipeline
enhanced = input | bilateral_filter(5.0, 10.0) | contrast(1.5) | brightness(0.1)