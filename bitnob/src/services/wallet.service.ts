import User from "../models/user"
import Wallet from "../models/wallet";
import logger from "../utils/logger";
import { createCustomer, generateWallet, getWalletBalance, sendCrypto } from "./bitnob.service";





export const activateWallet = async(userId: string) => {
    try {
        const user = await User.findOne({userId});
        if (!user) {
            throw new Error('User not found');
          }
      
          // Check if wallet already exists
          const existingWallet = await Wallet.findOne({ user: userId });
          if (existingWallet) {
            throw new Error('Wallet already activated');
          };

          const customerData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
          }

          const customer = await createCustomer(customerData);

          const wallet = await generateWallet(customer.id);

          const newWallet = await Wallet.create({
            user: userId,
            customerId: customer.id,
            walletId: wallet.id,
            balance: 0,
            currency: 'BTC',
            isActive: true
          });

          return newWallet;

    } catch (error: any) {
        logger.error('Error in activateWallet:', error);
        throw error;
      }
}



export const getWallet = async (userId: string) => {
    try {
        const wallet = await Wallet.findOne({user: userId});
        if (!wallet) {
            throw new Error('Wallet not found');
          }
          console.log(wallet);

          const balanceData = await getWalletBalance(wallet.customerId);
          wallet.balance = balanceData.balance;
    await wallet.save();

    return wallet;
    } catch (error: any) {
        logger.error('Error in getWallet:', error);
      throw error;
      }
    
}


export const sendCryptocurrency = async (
    userId: string, 
    input: {
    amount: number;
    address: string;
    currency: string;
    description?: string
}) => {
    try {
        const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error('Wallet not found');
    };

    if (wallet.balance < input.amount) {
        throw new Error('Insufficient balance');
      }
  
      // Send crypto via Bitnob
      const transaction = await sendCrypto({
        customerId: wallet.customerId,
        amount: input.amount,
        address: input.address,
        currency: input.currency,
        description: input.description,
      });
  
      // Update local balance
      wallet.balance -= input.amount;
      await wallet.save();
      
      return transaction;
    } catch (error: any) {
        logger.error('Error in sendCryptocurrency:', error);
        throw error;
      }
}