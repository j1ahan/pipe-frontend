# Single parameter lambda
result1 = input | pixel_op((p) => p * 0.5)

# Multi-parameter lambda  
result2 = input | stencil_op(3, (center, neighbors) => center * 2 - avg(neighbors))

# With field access
result3 = input | pixel_op((p) => (p.r + p.g + p.b) / 3)