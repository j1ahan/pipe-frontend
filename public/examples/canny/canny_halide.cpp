// Generator.cpp
#include <Halide.h>
using namespace Halide;

class CannyGenerator : public Halide::Generator<CannyGenerator> {
public:
    Input<Buffer<uint8_t>> input{"input", 3};
    Input<float> low_threshold{"low_threshold", 0.1f};
    Input<float> high_threshold{"high_threshold", 0.3f};
    Output<Buffer<uint8_t>> output{"output", 3};

    void generate() {
        Var x("x"), y("y"), c("c");

        // Step 1: Convert to grayscale
        Func gray("gray");
        Expr r = cast<float>(input(x, y, 0)) / 255.0f;
        Expr g = cast<float>(input(x, y, 1)) / 255.0f;
        Expr b = cast<float>(input(x, y, 2)) / 255.0f;
        gray(x, y) = 0.299f * r + 0.587f * g + 0.114f * b;

        // Step 2: Gaussian blur (5x5)
        Func gaussian("gaussian");
        
        // 5x5 Gaussian kernel coefficients
        float gauss_kernel[5][5] = {
            {2, 4, 5, 4, 2},
            {4, 9, 12, 9, 4},
            {5, 12, 15, 12, 5},
            {4, 9, 12, 9, 4},
            {2, 4, 5, 4, 2}
        };
        
        // Apply boundary conditions and compute gaussian
        Func gray_clamped = BoundaryConditions::repeat_edge(gray, {{0, input.width()}, {0, input.height()}});
        Expr gauss_sum = cast<float>(0);
        Expr valid_gaussian = x >= 2 && x < input.width() - 2 && y >= 2 && y < input.height() - 2;
        
        for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
                gauss_sum += gray_clamped(x + dx, y + dy) * gauss_kernel[dy + 2][dx + 2];
            }
        }
        gaussian(x, y) = select(valid_gaussian, gauss_sum / 159.0f, 0.0f);

        // Step 3: Sobel gradients
        Func grad_x("grad_x"), grad_y("grad_y");
        Func gaussian_clamped = BoundaryConditions::repeat_edge(gaussian, {{0, input.width()}, {0, input.height()}});
        Expr valid_sobel = x >= 1 && x < input.width() - 1 && y >= 1 && y < input.height() - 1;
        
        Expr gx = -gaussian_clamped(x-1, y-1) + gaussian_clamped(x+1, y-1) +
                  -2.0f * gaussian_clamped(x-1, y) + 2.0f * gaussian_clamped(x+1, y) +
                  -gaussian_clamped(x-1, y+1) + gaussian_clamped(x+1, y+1);
        
        Expr gy = -gaussian_clamped(x-1, y-1) - 2.0f * gaussian_clamped(x, y-1) - gaussian_clamped(x+1, y-1) +
                   gaussian_clamped(x-1, y+1) + 2.0f * gaussian_clamped(x, y+1) + gaussian_clamped(x+1, y+1);
        
        grad_x(x, y) = select(valid_sobel, gx, 0.0f);
        grad_y(x, y) = select(valid_sobel, gy, 0.0f);

        // Magnitude and direction
        Func magnitude("magnitude"), direction("direction");
        magnitude(x, y) = sqrt(grad_x(x, y) * grad_x(x, y) + grad_y(x, y) * grad_y(x, y));
        direction(x, y) = atan2(grad_y(x, y), grad_x(x, y));

        // Step 4: Non-maximum suppression
        Func nms("nms");
        Func magnitude_clamped = BoundaryConditions::repeat_edge(magnitude, {{0, input.width()}, {0, input.height()}});
        Expr valid_nms = x >= 1 && x < input.width() - 1 && y >= 1 && y < input.height() - 1;
        
        // Convert angle to degrees and normalize
        Expr angle_rad = direction(x, y);
        Expr angle = select(angle_rad < 0, angle_rad + 3.14159f, angle_rad);
        angle = angle * 180.0f / 3.14159f;
        
        // Get interpolated magnitudes based on gradient direction
        Expr mag_curr = magnitude(x, y);
        
        // Determine which neighbors to compare based on angle
        Expr cond1 = (angle >= 0 && angle < 22.5f) || (angle >= 157.5f && angle <= 180.0f);
        Expr cond2 = angle >= 22.5f && angle < 67.5f;
        Expr cond3 = angle >= 67.5f && angle < 112.5f;
        Expr cond4 = angle >= 112.5f && angle < 157.5f;
        
        Expr mag1 = select(cond1, magnitude_clamped(x-1, y),
                    select(cond2, magnitude_clamped(x+1, y-1),
                    select(cond3, magnitude_clamped(x, y-1),
                                  magnitude_clamped(x-1, y-1))));
        
        Expr mag2 = select(cond1, magnitude_clamped(x+1, y),
                    select(cond2, magnitude_clamped(x-1, y+1),
                    select(cond3, magnitude_clamped(x, y+1),
                                  magnitude_clamped(x+1, y+1))));
        
        // Keep only local maxima
        nms(x, y) = select(valid_nms && mag_curr >= mag1 && mag_curr >= mag2, mag_curr, 0.0f);

        // Step 5: Double thresholding
        Func edge_type("edge_type");
        edge_type(x, y) = select(nms(x, y) >= high_threshold, cast<uint8_t>(2),
                               select(nms(x, y) >= low_threshold, cast<uint8_t>(1),
                                      cast<uint8_t>(0)));

        // Output edge types for all channels (hysteresis tracking in post-processing)
        output(x, y, c) = edge_type(x, y);

        // Set estimates for autoscheduler
        input.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
        output.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
        low_threshold.set_estimate(0.1f);
        high_threshold.set_estimate(0.3f);
        
        // No manual scheduling - let the autoscheduler handle everything
    }
};

HALIDE_REGISTER_GENERATOR(CannyGenerator, canny_auto)

// Runner.cpp
#include <Halide.h>
#include <chrono>
#include <iostream>
#include <cstring>
#include <vector>

#define STB_IMAGE_IMPLEMENTATION
#include "../../../runtime/stb_image.h"
#define STB_IMAGE_WRITE_IMPLEMENTATION  
#include "../../../runtime/stb_image_write.h"

#include "canny_auto_aot.h"

using namespace Halide;

int main(int argc, char **argv) {
    if (argc < 3 || argc > 5) {
        std::cerr << "Usage: " << argv[0] << " <input_image> <output_image> [low_threshold] [high_threshold]\n";
        std::cerr << "Default thresholds: low=0.1, high=0.3\n";
        return 1;
    }

    // Parse thresholds
    float low_threshold = 0.1f;
    float high_threshold = 0.3f;
    
    if (argc >= 4) {
        low_threshold = std::stof(argv[3]);
    }
    if (argc >= 5) {
        high_threshold = std::stof(argv[4]);
    }

    // Load input image using STB
    int width, height, channels;
    unsigned char *input_data = stbi_load(argv[1], &width, &height, &channels, 3);
    if (!input_data) {
        std::cerr << "Failed to load input image: " << argv[1] << "\n";
        return 1;
    }

    std::cout << "Loaded image: " << width << "x" << height 
              << " (" << channels << " channels)\n";
    std::cout << "Using thresholds: low=" << low_threshold << ", high=" << high_threshold << "\n";

    // Create Halide buffer from loaded data
    Buffer<uint8_t> input(width, height, 3);
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            for (int c = 0; c < 3; c++) {
                input(x, y, c) = input_data[(y * width + x) * 3 + c];
            }
        }
    }
    stbi_image_free(input_data);

    // Prepare output buffer
    Buffer<uint8_t> output(width, height, 3);

    // Single execution
    std::cout << "Processing image with auto-scheduled Canny edge detection...\n";
    
    auto start = std::chrono::high_resolution_clock::now();
    
    int result = canny_auto(input.raw_buffer(), low_threshold, high_threshold, output.raw_buffer());
    
    if (result != 0) {
        std::cerr << "Error in Canny edge detection\n";
        return 1;
    }

    // Apply hysteresis tracking
    bool changed = true;
    while (changed) {
        changed = false;
        for (int y = 1; y < height - 1; y++) {
            for (int x = 1; x < width - 1; x++) {
                if (output(x, y, 0) == 1) {  // Weak edge
                    // Check 8-connected neighbors
                    for (int dy = -1; dy <= 1; dy++) {
                        for (int dx = -1; dx <= 1; dx++) {
                            if (dx == 0 && dy == 0) continue;
                            if (output(x + dx, y + dy, 0) == 2) {  // Strong edge
                                output(x, y, 0) = 2;
                                output(x, y, 1) = 2;
                                output(x, y, 2) = 2;
                                changed = true;
                                goto next_pixel;
                            }
                        }
                    }
                    next_pixel:;
                }
            }
        }
    }
    
    // Convert to final output (0 or 255)
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            uint8_t value = (output(x, y, 0) == 2) ? 255 : 0;
            output(x, y, 0) = value;
            output(x, y, 1) = value;
            output(x, y, 2) = value;
        }
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    std::cout << "Canny edge detection execution time: " << duration.count() << " microseconds\n";

    // Convert output to contiguous array for STB
    unsigned char *output_data = new unsigned char[width * height * 3];
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            for (int c = 0; c < 3; c++) {
                output_data[(y * width + x) * 3 + c] = output(x, y, c);
            }
        }
    }

    // Save output using STB
    const char *ext = strrchr(argv[2], '.');
    bool success = false;
    if (ext && strcmp(ext, ".png") == 0) {
        success = stbi_write_png(argv[2], width, height, 3, output_data, width * 3);
    } else if (ext && strcmp(ext, ".jpg") == 0) {
        success = stbi_write_jpg(argv[2], width, height, 3, output_data, 95);
    } else {
        std::cerr << "Unsupported output format. Use .png or .jpg\n";
    }
    
    delete[] output_data;
    
    if (!success) {
        std::cerr << "Failed to save output image\n";
        return 1;
    }
    
    std::cout << "Saved output: " << argv[2] << "\n";
    return 0;
}