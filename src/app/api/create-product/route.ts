import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
        });
    }

    try {
        const formData = await request.formData();
        
        // Extract text fields
        const title = formData.get('title') as string;
        const basePrice = formData.get('basePrice') as string;
        const offerPrice = formData.get('offerPrice') as string;
        const description = formData.get('description') as string;
        const detailedDescription = formData.get('detailedDescription') as string;
        const category = formData.get('category') as string;
        const subCategory = formData.get('subCategory') as string;
        const material = formData.get('material') as string;
        const stockQuantity = formData.get('stockQuantity') as string;
        const sku = formData.get('sku') as string;
        const weight = formData.get('weight') as string;
        const deliveryEstimate = formData.get('deliveryEstimate') as string || "5-7 business days";
        const isAvailable = formData.get('isAvailable') === 'true';
        const isActive = formData.get('isActive') === 'true';
        const isFeatured = formData.get('isFeatured') === 'true';
        
        // Extract arrays from form data
        const sizesJson = formData.get('sizes') as string;
        const stylesJson = formData.get('styles') as string;
        const tagsJson = formData.get('tags') as string;
        
        const sizes = sizesJson ? JSON.parse(sizesJson) : [];
        const styles = stylesJson ? JSON.parse(stylesJson) : [];
        const tags = tagsJson ? JSON.parse(tagsJson) : [];

        // Get images from form data
        const imageFiles = formData.getAll('images') as File[];
        const featuredImageFile = formData.get('featuredImage') as File;

        // Validate required fields
        if (!title || !basePrice || !description || !category || !material || !sku) {
            return new Response(
                JSON.stringify({ 
                    error: "Missing required fields: title, basePrice, description, category, material, sku" 
                }),
                { status: 400 }
            );
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return new Response(
                JSON.stringify({ 
                    error: "Product with this SKU already exists" 
                }),
                { status: 400 }
            );
        }

        // Validate sizes array structure
        if (sizes && Array.isArray(sizes)) {
            for (const size of sizes) {
                if (!size.size || !size.price) {
                    return new Response(
                        JSON.stringify({ 
                            error: "Each size must have both 'size' and 'price' fields" 
                        }),
                        { status: 400 }
                    );
                }
            }
        }

        // Validate styles array structure
        if (styles && Array.isArray(styles)) {
            for (const style of styles) {
                if (!style.name) {
                    return new Response(
                        JSON.stringify({ 
                            error: "Each style must have a 'name' field" 
                        }),
                        { status: 400 }
                    );
                }
            }
        }

        // Upload images and get URLs
        const adminId = session.user._id!; // Assuming user ID is available in session
        const uploadedImages: string[] = [];
        let featuredImageUrl = '';

        // Upload featured image
        if (featuredImageFile) {
            featuredImageUrl = await uploadImage(featuredImageFile, adminId);
        }

        // Upload additional images
        for (const imageFile of imageFiles) {
            if (imageFile && imageFile.size > 0) {
                const imageUrl = await uploadImage(imageFile, adminId);
                uploadedImages.push(imageUrl);
            }
        }

        // If no featured image was uploaded but we have other images, use the first one
        if (!featuredImageUrl && uploadedImages.length > 0) {
            featuredImageUrl = uploadedImages[0];
        }

        // Validate that we have at least one image
        if (!featuredImageUrl) {
            return new Response(
                JSON.stringify({ 
                    error: "At least one image is required" 
                }),
                { status: 400 }
            );
        }

        // Create new product
        const newProduct = new Product({
            title: title.trim(),
            basePrice: Number(basePrice),
            offerPrice: offerPrice ? Number(offerPrice) : undefined,
            description: description.trim(),
            detailedDescription: detailedDescription?.trim(),
            category: category.trim(),
            subCategory: subCategory?.trim(),
            material: material.trim(),
            isAvailable,
            stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
            sku: sku.trim().toUpperCase(),
            sizes: sizes.map((size: any) => ({
                size: size.size.trim(),
                price: Number(size.price),
                offerPrice: size.offerPrice ? Number(size.offerPrice) : undefined,
                dimensions: size.dimensions ? {
                    width: Number(size.dimensions.width),
                    height: Number(size.dimensions.height),
                    unit: size.dimensions.unit || 'inches'
                } : undefined
            })),
            styles: styles.map((style: any) => ({
                name: style.name.trim(),
                additionalPrice: style.additionalPrice ? Number(style.additionalPrice) : 0
            })),
            images: uploadedImages,
            featuredImage: featuredImageUrl,
            tags: Array.isArray(tags) ? tags.map((tag: string) => tag.trim()) : [],
            weight: weight ? Number(weight) : undefined,
            deliveryEstimate,
            isActive,
            isFeatured
        });

        // Save product to database
        const savedProduct = await newProduct.save();

        return new Response(
            JSON.stringify({
                success: true,
                message: "Product created successfully",
                product: savedProduct
            }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

    } catch (error: any) {
        console.error("Product creation error:", error);

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return new Response(
                JSON.stringify({ 
                    error: "Validation failed", 
                    details: errors 
                }),
                { status: 400 }
            );
        }

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return new Response(
                JSON.stringify({ 
                    error: "Product with this SKU or title already exists" 
                }),
                { status: 400 }
            );
        }

        // General server error
        return new Response(
            JSON.stringify({ 
                error: "Internal server error",
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            }),
            { status: 500 }
        );
    }
}

// Image upload utility function
async function uploadImage(image: File, adminId: string): Promise<string> {
    try {
        const buffer = Buffer.from(await image.arrayBuffer());

        // Use consistent upload path that matches nginx serving
        const uploadDir = path.join(process.cwd(), "public", "uploads", adminId.toString());
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        // ✅ Use absolute URL instead of relative
        // const publicUrl = `https://admin.novaprompt.in/uploads/${adminId}/${filename}`;
        const publicUrl = `/uploads/${adminId}/${filename}`;
        
        return publicUrl;
    } catch (error) {
        console.error("Image upload error:", error);
        throw new Error("Failed to upload image");
    }
}