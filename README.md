# FrameKart - E-Commerce Platform

A complete, production-ready e-commerce platform built with Next.js, featuring local image storage, MongoDB, and WhatsApp order notifications.

## Features

- 🛍️ **Product Catalog**: Browse products with category filtering, search, and price range filters
- 🖼️ **Local Image Storage**: Upload and store product images locally on the server (no Cloudinary required)
- 🛒 **Shopping Cart**: Full cart functionality with persistent storage
- 📱 **WhatsApp Integration**: Automatic order notifications via Meta WhatsApp Cloud API
- 👨‍💼 **Admin Dashboard**: Complete product and order management
- 🎨 **Modern UI**: Built with Tailwind CSS and responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Image Storage**: Local filesystem (`/public/uploads/products/`)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frame-kart
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `MONGODB_URI`: Your MongoDB connection string
- `NEXT_PUBLIC_BASE_URL`: Your app URL (default: http://localhost:3000)
- WhatsApp API credentials (optional, for order notifications)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frame-kart/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── products/     # Product CRUD
│   │   │   ├── upload/       # Image upload
│   │   │   └── orders/       # Order management
│   │   ├── products/         # Product pages
│   │   ├── cart/             # Cart page
│   │   └── admin/            # Admin dashboard
│   ├── components/           # Reusable components
│   ├── context/              # React context (Cart)
│   ├── lib/                  # Utilities (MongoDB connection)
│   └── models/               # Mongoose models
├── public/
│   └── uploads/
│       └── products/         # Product images (local storage)
└── package.json
```

## API Routes

### Products
- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Upload
- `POST /api/upload` - Upload product image (multipart/form-data)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status

## Admin Dashboard

Access the admin panel at `/admin/products` or `/admin/orders`.

### Product Management
- Add new products with multiple images
- Edit existing products
- Delete products (images are automatically cleaned up)

### Order Management
- View all orders with customer details
- Update order status (pending, completed, cancelled)
- Filter orders by status

## Image Upload

Images are stored locally in `/public/uploads/products/`. The upload API:
- Validates file types (JPEG, PNG, WebP)
- Limits file size to 5MB
- Generates unique filenames
- Automatically creates the uploads directory if it doesn't exist

## WhatsApp Integration

To enable WhatsApp order notifications:

1. Set up a Meta WhatsApp Business Account
2. Get your API credentials from [Meta for Developers](https://developers.facebook.com/docs/whatsapp/cloud-api)
3. Add the following to your `.env.local`:
   ```
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ADMIN_PHONE_NUMBER=+1234567890
   ```

When a customer places an order, the admin will receive a WhatsApp message with order details.

## Database Schema

### Product
```typescript
{
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];  // Array of filenames
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
{
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

- Ensure MongoDB is accessible from your deployment
- Set `NEXT_PUBLIC_BASE_URL` to your production URL
- For local image storage, ensure the `/public/uploads/products/` directory is writable
- Consider using a cloud storage service (S3, Cloudinary) for production

## Future Enhancements

- User authentication and accounts
- Payment gateway integration
- Product reviews and ratings
- Email notifications
- Advanced analytics
- Multi-vendor support

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
