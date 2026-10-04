// src/utils/toast.js
import { toast } from "react-toastify";

export const toastSuccess = (msg, opts = {}) =>
    toast.success(msg, { position: "top-right", autoClose: 2500, ...opts });

export const toastError = (msg, opts = {}) =>
    toast.error(msg || "Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3500,
        ...opts
    });

export const toastInfo = (msg, opts = {}) =>
    toast.info(msg, { position: "top-right", autoClose: 2500, ...opts });

export const toastWarn = (msg, opts = {}) =>
    toast.warn(msg, { position: "top-right", autoClose: 3000, ...opts });

export const toastPromise = (promise, msgs) =>
    toast.promise(promise, msgs);