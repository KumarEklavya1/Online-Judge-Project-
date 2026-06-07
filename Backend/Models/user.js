import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true }, // The new Codeforces-style handle
  FullName: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  DOB: { type: Date }, // Collected at signup, but not used for logging in
});

// ES Module export
const User = mongoose.model('User', userSchema);
export default User;