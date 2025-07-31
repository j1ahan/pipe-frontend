# Simple Canny edge detection
edges = input | canny_edge(0.1, 0.3)

# Full Canny pipeline (manual steps)
canny_manual = input | 
  grayscale | 
  gaussian_blur(5) |
  sobel_xy |
  gradient_magnitude |
  non_max_suppression |
  double_threshold(0.1, 0.3) |
  hysteresis_tracking