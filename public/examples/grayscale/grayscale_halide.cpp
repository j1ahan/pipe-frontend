// Runner.cpp
#include <Halide.h>
#include <chrono>
#include <iostream>
#include <cstring>

#define STB_IMAGE_IMPLEMENTATION
#include "../../../runtime/stb_image.h"
#define STB_IMAGE_WRITE_IMPLEMENTATION  
#include "../../../runtime/stb_image_write.h"

#include "grayscale_auto_aot.h"

using namespace Halide;

int main(int argc, char **argv) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <input_image> <output_image>\n";
        return 1;
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
    std::cout << "Processing image with auto-scheduled grayscale...\n";
    
    int result = grayscale_auto(input.raw_buffer(), output.raw_buffer());
    
    if (result != 0) {
        std::cerr << "Error in grayscale conversion\n";
        return 1;
    }

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
// Generator.cpp
#include "Halide.h"

using namespace Halide;

class GrayscaleAutoGenerator : public Halide::Generator<GrayscaleAutoGenerator> {
public:
    Input<Buffer<uint8_t>> input{"input", 3};
    Output<Buffer<uint8_t>> output{"output", 3};  // Keep 3 channels for fair comparison

    void generate() {
        Var x("x"), y("y"), c("c");

        // Grayscale conversion using standard weights
        Expr r = input(x, y, 0);
        Expr g = input(x, y, 1);
        Expr b = input(x, y, 2);
        
        // Use integer arithmetic for better performance
        // Weights scaled by 1024: 0.299*1024=306, 0.587*1024=601, 0.114*1024=117
        Expr gray_value = (306 * cast<int32_t>(r) + 
                          601 * cast<int32_t>(g) + 
                          117 * cast<int32_t>(b)) >> 10;
        
        // Clamp to valid range and cast
        gray_value = clamp(gray_value, 0, 255);
        Expr gray_uint8 = cast<uint8_t>(gray_value);
        
        // Replicate to all channels
        output(x, y, c) = gray_uint8;
        
        // Set estimates for autoscheduler
        input.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
        output.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
        
        // No manual scheduling - let the autoscheduler handle everything
    }
};

HALIDE_REGISTER_GENERATOR(GrayscaleAutoGenerator, grayscale_auto)