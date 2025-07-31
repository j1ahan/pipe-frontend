# 3x3 stencil for blur
custom_blur = input | stencil_op(3, (center, neighbors) => avg(neighbors))

# Edge enhancement
edges = input | stencil_op(3, (center, neighbors) => 
  center * 9 - sum(neighbors)
)

# Custom kernel size
large_blur = input | stencil_op(5, (center, neighbors) => avg(neighbors))