# Connect weak edges to strong edges
final_edges = input | 
  grayscale |
  sobel |
  double_threshold(50.0, 150.0) |
  hysteresis_tracking