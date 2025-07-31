// Complete pipeline-based Canny edge detection
// Using combined operators to handle data flow limitations

// Pipeline:
// 1. Grayscale conversion
// 2. Gaussian blur (5x5)
// 3. Combined Sobel X/Y gradients
// 4. Combined magnitude/direction computation
// 5. Non-maximum suppression
// 6. Double thresholding
// 7. Hysteresis edge tracking

result = pixel_op(p => grayscale) 
| stencil_op(5, gaussian_blur(5)) 
| stencil_op(3, sobel_xy) 
| pixel_op(p => magnitude_direction) 
| stencil_op(3, non_max_suppression) 
| stencil_op(1, double_threshold(0.018, 0.054)) 
| stencil_op(3, hysteresis_tracking)

// Or run with built-in operator
// canny_edges = stencil_op(3, canny_edge(0.1, 0.3))