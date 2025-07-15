import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { OrderServices } from "./order.service";
import { OrderModel } from "./order.model";
import AppError from "../../errors/AppError";
import { exportGroupedProductsToExcel } from "../../utils/exportToExcel";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await OrderServices.createOrderIntoDB(body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order created successfully",
    data: result,
  });
});

const getOrderInvoicePdf = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const pdfBuffer = await OrderServices.generateOrderInvoicePdf(id);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline; filename=arbora-invoice.pdf",
  });

  res.status(httpStatus.OK).send(pdfBuffer);
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getAllOrdersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders fetched successfully",
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.getSingleOrderFromDB(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order fetched successfully",
    data: result,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const existingOrder = await OrderModel.findById(id);

  if (!existingOrder || existingOrder.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await OrderServices.updateOrderIntoDB(id, updatePayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order updated successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.deleteOrderIntoDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order deleted successfully",
    data: result,
  });
});

// Get Products Grouped By Category
const getProductsGroupedByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getProductsGroupedByCategory();

    // ✅ Check if client wants Excel export
    const shouldDownload = req.query.download === "true";

    if (shouldDownload) {
      return exportGroupedProductsToExcel(result, res);
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Products grouped by category",
      data: result,
    });
  }
);

const getProductSegmentationCtrl = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getProductSegmentation();

<<<<<<< .merge_file_bMRaXu
    // ✅ Check if client wants Excel export
=======
       // ✅ Check if client wants Excel export
>>>>>>> .merge_file_SepoCP
    const shouldDownload = req.query.download === "true";

    if (shouldDownload) {
      return exportGroupedProductsToExcel(result, res);
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Products segmented ..",
      data: result,
    });
  }
);

<<<<<<< .merge_file_bMRaXu
=======


// Best and worst selling product for dashboard
>>>>>>> .merge_file_SepoCP
export const getBestSellingProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const data = await OrderServices.getBestSellingProducts(limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Best selling products fetched successfully",
      data,
    });
  }
);

export const getWorstSellingProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const data = await OrderServices.getWorstSellingProducts(limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Worst selling products fetched successfully",
      data,
    });
  }
);


export const getChart = catchAsync(
  async (req: Request, res: Response) => {
    const data = await OrderServices.getChartData();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Chart data fetched successfully",
      data,
    });
  }
);

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  getOrderInvoicePdf,
  getProductsGroupedByCategory,
  getProductSegmentationCtrl,
  getBestSellingProductsController,
  getWorstSellingProductsController,
<<<<<<< .merge_file_bMRaXu
  getChart
};
=======
<<<<<<< HEAD
};
=======
  getChart
};
>>>>>>> charts
>>>>>>> .merge_file_SepoCP
