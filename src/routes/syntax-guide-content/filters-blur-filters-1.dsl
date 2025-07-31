# Different kernel sizes
slight_blur = input | gaussian_blur(3)
medium_blur = input | gaussian_blur(5)
heavy_blur = input | gaussian_blur(9)

# Pre-processing for edge detection
preprocessed = input | gaussian_blur(5) | sobel