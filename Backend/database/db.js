import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We add { family: 4 } to force Node.js to use IPv4 instead of IPv6
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4 
    });
    
    console.log(`✅ Database Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;