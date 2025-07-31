# Load and preprocess image
input = load_image("photo.jpg")
preprocessed = input | grayscale | gaussian_blur(3)

# Detect edges using different methods
sobel_edges = preprocessed | sobel | threshold(0.1)
canny_edges = preprocessed | canny_edge(0.1, 0.3)

# Advanced edge detection with custom processing
gradient_x = preprocessed | sobel_x
gradient_y = preprocessed | sobel_y
magnitude = preprocessed | sobel_xy | gradient_magnitude
thin_edges = magnitude | non_max_suppression | threshold(0.15)