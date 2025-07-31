# Image enhancement pipeline
enhanced = input | 
  bilateral_filter(3.0, 10.0) |
  contrast(1.2) |
  brightness(0.05)

# Feature extraction pipeline
features = input |
  grayscale |
  gaussian_blur(3) |
  sobel_xy |
  gradient_magnitude |
  non_max_suppression |
  threshold(0.15)

# Multi-stage processing
stage1 = input | bilateral_filter(5.0, 20.0)
stage2 = stage1 | contrast(1.3)
stage3 = stage2 | canny_edge(0.1, 0.3)
result = stage3 | pixel_op((p) => p * mask)