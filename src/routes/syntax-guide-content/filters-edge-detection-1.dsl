# Basic Sobel edge detection
edges = input | grayscale | sobel

# Directional Sobel
horizontal_edges = input | grayscale | sobel_x
vertical_edges = input | grayscale | sobel_y

# Combined X and Y gradients
gradients = input | grayscale | sobel_xy

# Gradient magnitude and direction
magnitude = input | grayscale | sobel_xy | gradient_magnitude
direction = input | grayscale | sobel_xy | gradient_direction

# Both magnitude and direction
mag_dir = input | grayscale | magnitude_direction