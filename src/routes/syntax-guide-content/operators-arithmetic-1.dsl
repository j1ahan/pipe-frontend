# In lambda expressions
scaled = input | pixel_op((p) => p * 0.5 + 0.25)

# Parameter calculations
blur_size = base_size * 2 + 1
threshold_mid = (threshold_low + threshold_high) / 2

# Complex expressions
adjusted = input | pixel_op((p) => 
  (p - 0.5) * contrast_factor + 0.5 + brightness_offset
)