# Thin edges after gradient calculation
thin_edges = input | 
  grayscale | 
  sobel_xy | 
  gradient_magnitude |
  non_max_suppression