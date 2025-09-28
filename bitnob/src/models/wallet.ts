import mongoose from "mongoose";
import { IUser } from "./user";



export interface IWallet extends Document {
    user: IUser['_id'];
    customerId: string;
    walletId: string;
    balance: number;
    currency: string;
    isActive: boolean;
}

const WalletSchema = new mongoose.Schema<IWallet>(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
      customerId: { type: String, required: true },
      walletId: { type: String, required: true },
      balance: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  
  const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
  export default Wallet;