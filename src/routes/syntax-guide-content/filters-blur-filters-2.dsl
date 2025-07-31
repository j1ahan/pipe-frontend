# Edge-preserving blur
# bilateral_filter(spatial_sigma, range_sigma)
smooth = input | bilateral_filter(5.0, 10.0)

# Strong noise reduction while preserving edges
denoised = input | bilateral_filter(9.0, 50.0)

# Subtle smoothing
subtle = input | bilateral_filter(3.0, 5.0)