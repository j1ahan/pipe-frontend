// Generator.cpp
#include "Halide.h"

using namespace Halide;

class Gaussian3x3AutoGenerator : public Halide::Generator<Gaussian3x3AutoGenerator> {
public:
    Input<Buffer<uint8_t>> input{"input", 3};
    Output<Buffer<uint8_t>> output{"output", 3};

    void generate() {
        Var x("x"), y("y"), c("c");

        // Convert to float for processing with boundary handling
        Func input_bounded("input_bounded");
        input_bounded = BoundaryConditions::repeat_edge(input);
        
        Func input_float("input_float");
        input_float(x, y, c) = cast<float>(input_bounded(x, y, c)) / 255.0f;

        // Define the 3x3 Gaussian kernel (normalized)
        // Using approximation: [1 2 1; 2 4 2; 1 2 1] / 16
        Func blur_x("blur_x");
        blur_x(x, y, c) = (input_float(x-1, y, c) + 
                          2.0f * input_float(x, y, c) + 
                          input_float(x+1, y, c)) * 0.25f;

        Func blur_y("blur_y");
        blur_y(x, y, c) = (blur_x(x, y-1, c) + 
                          2.0f * blur_x(x, y, c) + 
                          blur_x(x, y+1, c)) * 0.25f;

        // Convert back to uint8
        output(x, y, c) = cast<uint8_t>(clamp(blur_y(x, y, c) * 255.0f, 0.0f, 255.0f));

        // Set estimates for autoscheduler
        input.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
        output.set_estimates({{0, 1920}, {0, 1080}, {0, 3}});
    }
};

HALIDE_REGISTER_GENERATOR(Gaussian3x3AutoGenerator, gaussian3x3_auto)

// Runner.cpp
#include <Halide.h>
#include <chrono>
#include <iostream>
#include <cstring>

#define STB_IMAGE_IMPLEMENTATION
#include "../../../runtime/stb_image.h"
#define STB_IMAGE_WRITE_IMPLEMENTATION  
#include "../../../runtime/stb_image_write.h"

#include "gaussian3x3_auto_aot.h"

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
    std::cout << "Processing image with auto-scheduled gaussian3x3...\n";
    
    int result = gaussian3x3_auto(input.raw_buffer(), output.raw_buffer());
    
    if (result != 0) {
        std::cerr << "Error in gaussian blur\n";
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