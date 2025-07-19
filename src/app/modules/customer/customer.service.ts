/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ICustomer } from "./customer.interface";
import { CustomerModel } from "./customer.model";
import { OrderModel } from "../order/order.model";
import { Types } from "mongoose";
import { PaymentModel } from "../payment/payment.model";
import { sendOpenBalanceEmail } from "../../utils/sendMail";
import { generatePdf } from "../../utils/pdfCreate";

const createCustomerIntoDB = async (payLoad: ICustomer) => {
  const { storeName } = payLoad;

  const checkExistingCustomer = await CustomerModel.findOne({ storeName, isDeleted: false });

  if (checkExistingCustomer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This store name is already in use!"
    );
  }

  const customerData = {
    storeName: payLoad.storeName,
    storePhone: payLoad.storePhone,
    storePersonEmail: payLoad.storePersonEmail,
    salesTaxId: payLoad.salesTaxId,
    acceptedDeliveryDays: payLoad.acceptedDeliveryDays,
    bankACHAccountInfo: payLoad.bankACHAccountInfo,
    storePersonName: payLoad.storePersonName,
    storePersonPhone: payLoad.storePersonPhone,
    billingAddress: payLoad.billingAddress,
    billingState: payLoad.billingState,
    billingZipcode: payLoad.billingZipcode,
    billingCity: payLoad.billingCity,
    shippingAddress: payLoad.shippingAddress,
    shippingState: payLoad.shippingState,
    shippingZipcode: payLoad.shippingZipcode,
    shippingCity: payLoad.shippingCity,
    creditApplication: payLoad.creditApplication,
    ownerLegalFrontImage: payLoad.ownerLegalFrontImage,
    ownerLegalBackImage: payLoad.ownerLegalBackImage,
    voidedCheckImage: payLoad.voidedCheckImage,
  };

  const createdCustomer = await CustomerModel.create(customerData);

  return createdCustomer;
};




const getAllCustomersFromDB = async () => {
  // Fetch all non-deleted customers
  const customers = await CustomerModel.find({ isDeleted: false }).lean();

  // Fetch all non-deleted orders
  const orders = await OrderModel.find({ isDeleted: false }).lean();

  // Fetch all non-deleted payments
  const payments = await PaymentModel.find({ isDeleted: false }).lean();

  // Create maps for order count, openBalance sum, and totalOrderAmount sum per storeId
  const orderCountMap = new Map<string, number>();
  const openBalanceMap = new Map<string, number>();
  const totalOrderAmountMap = new Map<string, number>();

  // Aggregate order stats
  orders.forEach(order => {
    const storeId = order.storeId.toString();
    // Increment order count
    orderCountMap.set(storeId, (orderCountMap.get(storeId) || 0) + 1);
    // Sum openBalance
    openBalanceMap.set(storeId, (openBalanceMap.get(storeId) || 0) + (order.openBalance || 0));
    // Sum totalOrderAmount
    totalOrderAmountMap.set(storeId, (totalOrderAmountMap.get(storeId) || 0) + (order.orderAmount || 0));
  });

  // Add totalOrders, openBalance, totalOrderAmount, customerOrders, and customerPayments to each customer
  const result = customers.map(customer => {
    const customerId = customer._id.toString();
    return {
      ...customer,
      totalOrders: orderCountMap.get(customerId) || 0,
      openBalance: openBalanceMap.get(customerId) || 0,
      totalOrderAmount: totalOrderAmountMap.get(customerId) || 0,
      customerOrders: orders.filter(order => order.storeId.toString() === customerId),
      customerPayments: payments.filter(payment => payment.storeId.toString() === customerId),
    };
  });

  return result;
};

const sendEmailForNotPaidOrders = async (customerId: string) => {
  // Fetch customer data
  const customer = await getSingleCustomerFromDB(customerId);

  // Filter orders with open balance greater than 0
  const unpaidOrders = customer.customerOrders.filter(order => order.openBalance > 0);

  if (unpaidOrders.length === 0) {
    return { storePersonEmail: customer.storePersonEmail, unpaidOrders: [] };
  }

  // Prepare data for email
  const emailData = {
    storePersonEmail: customer.storePersonEmail,
    unpaidOrders,
  };

  // Send email
  await sendOpenBalanceEmail(emailData);

  return emailData;
};

const getSingleCustomerFromDB = async (id: string) => {
  const result = await CustomerModel.findOne({ _id: id, isDeleted: false }).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found or already deleted");
  }

  // Aggregate order count, openBalance, and totalOrderAmount for this customer
  const orderStats = await OrderModel.aggregate([
    { $match: { storeId: new Types.ObjectId(id), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        openBalance: { $sum: "$openBalance" },
        totalOrderAmount: { $sum: "$orderAmount" },
      },
    },
  ]);

  // Fetch customer orders
  const customerOrders = await OrderModel.find({ storeId: id, isDeleted: false }).lean();

  // Fetch customer payments
  const customerPayments = await PaymentModel.find({ storeId: id, isDeleted: false }).lean();

  return {
    ...result,
    totalOrders: orderStats[0]?.totalOrders || 0,
    openBalance: orderStats[0]?.openBalance || 0,
    totalOrderAmount: orderStats[0]?.totalOrderAmount || 0,
    customerOrders,
    customerPayments,
  };
};

const updateCustomerIntoDB = async (id: string, payload: Partial<ICustomer>) => {
  const updateData = {
    storeName: payload.storeName,
    storePhone: payload.storePhone,
    storePersonEmail: payload.storePersonEmail,
    salesTaxId: payload.salesTaxId,
    acceptedDeliveryDays: payload.acceptedDeliveryDays,
    bankACHAccountInfo: payload.bankACHAccountInfo,
    storePersonName: payload.storePersonName,
    storePersonPhone: payload.storePersonPhone,
    billingAddress: payload.billingAddress,
    billingState: payload.billingState,
    billingZipcode: payload.billingZipcode,
    billingCity: payload.billingCity,
    shippingAddress: payload.shippingAddress,
    shippingState: payload.shippingState,
    shippingZipcode: payload.shippingZipcode,
    shippingCity: payload.shippingCity,
    creditApplication: payload.creditApplication,
    ownerLegalFrontImage: payload.ownerLegalFrontImage,
    ownerLegalBackImage: payload.ownerLegalBackImage,
    voidedCheckImage: payload.voidedCheckImage,
  };

  const updatedCustomer = await CustomerModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ isDeleted: false });

  if (!updatedCustomer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found or already deleted");
  }

  return updatedCustomer;
};

const deleteCustomerIntoDB = async (id: string) => {
  const result = await CustomerModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return result;
};

const generatePallet = async (customerId: string): Promise<Buffer> => {
  // Fetch customer data
  const customer = await getSingleCustomerFromDB(customerId);

  // Generate HTML content for the pallet PDF
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 10px; background-color: #fff; }
          .container { max-width: 800px; margin: 0 auto; text-align: center; }
          .header { height: 100px; display: flex; justify-content: center; align-items: center; width: 100%; margin-bottom: 20px; }
          .customer-info { text-align: center; margin-bottom: 20px; }
          .store-name { font-size: 48px; font-weight: bold; color: #4CAF50; }
          .billing-address { font-size: 24px; color: #777; }
          .pallet-label { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .pallet-label-b { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .horizontal-line { border-top: 2px solid #333; width: 50%; margin: 0 auto 20px; }
          .footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-top: 1px solid #ddd; margin-top: 20px; }
          .logo { width: 120px; }
          .company-info { text-align: left; }
          .company-info p { margin: 2px 0; font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"></div>
          <div class="customer-info">
            <div class="store-name">${customer.storeName || "N/A"}</div>
            <div class="billing-address">${customer.billingAddress || "N/A"}, ${customer.billingCity || "N/A"}, ${customer.billingState || "N/A"}, ${customer.billingZipcode || "N/A"}</div>
          </div>
          <div class="pallet-label">Pallet</div>
          <div class="pallet-label-b">____Of____</div>
          <div class="horizontal-line"></div>
          <div class="footer">
            <img src="https://i.postimg.cc/QMdNcbrC/Arbora-Logo.jpg" alt="Arbora Logo" class="logo" />
            <div class="company-info">
              <p>Arbora</p>
              <p>123 Paper Lane, Dhaka, Bangladesh</p>
              <p>Phone: +880-1234-567890</p>
              <p>Email: accounts@arbora.com</p>
              <p>Contact: John Doe</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Generate PDF using the utility function
  const pdfBuffer = await generatePdf(htmlContent);
  return pdfBuffer;
};

export const CustomerServices = {
  createCustomerIntoDB,
  getAllCustomersFromDB,
  getSingleCustomerFromDB,
  updateCustomerIntoDB,
  deleteCustomerIntoDB,
  sendEmailForNotPaidOrders,
  generatePallet
};

