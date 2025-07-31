# Basic filter usage
gray = input | grayscale
bright = input | brightness(0.3)
high_contrast = input | contrast(1.5)
binary = input | grayscale | threshold(0.5)