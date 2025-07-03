/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "./user.interface";
import { UserModel } from "./user.model";
import config from "../../config";

const createUserIntoDB = async (payLoad: IUser) => {
  const { email } = payLoad;

  const checkExistingUser = await UserModel.findOne({ email });

  if (checkExistingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "This email is already in use!");
  }

  const userData = {
    firstName : payLoad.firstName,
    lastName: payLoad.lastName,
    image: payLoad.image,
    email: payLoad.email,
    password: payLoad.password
  };

  const createdUser = await UserModel.create(userData);

  return createdUser;
};

const getAllUsersFromDB = async () => {
  const result = await UserModel.find().select("-password");

  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await UserModel.findById(id);
  return result;
};

const updateUserProfileIntoDB = async (id: string, payload: any) => {

  const updateData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    image: payload.image,
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    { id },
    { $set: updateData },
    {
      new: true,
    }
  ).select("-password");

  return updatedUser;
};

const changePassword = async (user:any, id: string, payload: any) => {


  const existingUser = await UserModel.findById(id).select(
    "+password"
  );
  if (!existingUser) {
    throw new Error("User not found");
  }

  if (!payload.oldPassword || !payload.newPassword) {
    throw new Error("Old password and new password are required");
  }

  if (user?.role == "superAdmin") {
    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));

    const updatedUser = await UserModel.findByIdAndUpdate(
      { id },
      { $set: { password: hashedPassword } },
      {
        new: true,
      }
    ).select("+password");

    return updatedUser;
  } else {
    const isOldPasswordCorrect = await bcrypt.compare(
      payload.oldPassword,
      existingUser.password
    );

    if (!isOldPasswordCorrect) {
      throw new AppError(401, "Old password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));

    const updatedUser = await UserModel.findByIdAndUpdate(
      { id },
      { $set: { userPassword: hashedPassword } },
      {
        new: true,
        runValidators: true,
      }
    ).select("+password");

    return updatedUser;
  }
};

const deleteUserIntoDB = async (id: string) => {
    return UserModel.findByIdAndDelete(id);
};

export const UserServices = {
  createUserIntoDB,
  updateUserProfileIntoDB,
  changePassword,
  getAllUsersFromDB,
  deleteUserIntoDB,
  getSingleUserFromDB,
};
