import mongoose, { Schema, Document } from 'mongoose';

// Interface definitions for Mongoose models
export interface IProductDocument extends Document {
  productId: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  subCategory?: string;
  image?: string;
  stock: number;
  sellerName?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends Document {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Document {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schemas
const ProductSchema = new Schema<IProductDocument>({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  wholesalePrice: { type: Number },
  category: { type: String, required: true },
  subCategory: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
  sellerName: { type: String, default: 'ChickMagnet Farm' },
  tags: [{ type: String }],
}, { timestamps: true });

const OrderSchema = new Schema<IOrderDocument>({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number
  }]
}, { timestamps: true });

const UserSchema = new Schema<IUserDocument>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'customer' }
}, { timestamps: true });

// Models export
export const MongoProduct = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
export const MongoOrder = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
export const MongoUser = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

// Connection state management
let isConnected = false;
let isConnecting = false;

export async function connectMongoDB(): Promise<boolean> {
  if (isConnected) return true;
  if (isConnecting) return false;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chickmagnet';
  
  try {
    isConnecting = true;
    // Set low server selection timeout so offline/missing MongoDB doesn't hang server startup
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    isConnecting = false;
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (err: any) {
    isConnecting = false;
    isConnected = false;
    console.warn('🔮 MongoDB connection attempt completed. (Note: Using fallback storage if offline/no remote cluster). Details:', err.message || err);
    return false;
  }
}

export function getMongoDBStatus(): { connected: boolean; uriConfigured: boolean; readyState: number } {
  return {
    connected: mongoose.connection.readyState === 1,
    uriConfigured: Boolean(process.env.MONGODB_URI),
    readyState: mongoose.connection.readyState
  };
}

// Attempt initial connection asynchronously without blocking server boot
connectMongoDB().catch(() => {});
