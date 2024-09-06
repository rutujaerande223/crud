import express from "express";
import { create, deleteUser, fetch, signIn, signUp, update } from "../controller/userController.js";
import { createCustomer, deleteCustomer, getCustomer, updateCustomer } from "../controller/customerController.js";

const route = express.Router();

//USER
route.get("/fetch", fetch);
route.post("/create", create);
route.put("/update/:id", update);
route.delete("/delete/:id", deleteUser);
route.post("/signup",signUp);
route.post("/signin",signIn);

//CUSTOMER
route.post("/createCustomer", createCustomer);
route.get("/getCustomer", getCustomer);
route.put("/updateCustomer/:id", updateCustomer);
route.delete("/deleteCustomer/:id", deleteCustomer);


export default route;