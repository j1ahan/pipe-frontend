# Classify edge pixels as strong or weak
classified = input | 
  grayscale | 
  sobel | 
  double_threshold(50.0, 150.0)