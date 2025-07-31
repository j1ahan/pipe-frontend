# Load an image and assign to variable
input = load_image("photo.jpg")

# Apply operations and store result
gray = input | grayscale
blurred = gray | gaussian_blur(5)

# Numeric values
threshold_low = 0.1
threshold_high = 0.3