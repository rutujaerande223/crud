import Customer from "../schema/customerModule.js";

// CREATE a new customer
export const createCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// READ all customers
export const getCustomer = async (req, res) => {
    try {
        const {page=1,limit=10,name='',phoneNumber=''}=req.query;
        const pageNumber=parseInt(page,10);
        const limitNumber=parseInt(limit,10);

        const searchFilter=name || phoneNumber?{name:new RegExp(name,'i')}:{};

        const customers = await Customer.find(searchFilter)
        .skip((pageNumber-1)*limitNumber)
        .limit(limitNumber);

        const totalCustomers=await Customer.countDocuments(searchFilter);
        if(customers.length===0){
            return res.status(404).json({message:"customer not found"})
        }

        res.status(200).json({
            totalCustomers,
            totalPage:Math.ceil(totalCustomers/limitNumber),
            currentPage:pageNumber,
            customers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// UPDATE a customer by ID
export const updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const custExist = await Customer.findOne({ _id: id });
        if (!custExist) {
            return res.status(404).json({ message: "user not found" });

        }
        const updatedcustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true })
        res.status(201).json(updatedcustomer);
    } catch {
        res.status(500).json({ error: "Internal server error" })

    }
}

// DELETE a customer by ID

export const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const custExist = await Customer.findOne({ _id: id });
        if (!custExist) {
            return res.status(404).json({ message: "user not found" });

        }
        await Customer.findByIdAndDelete(id);
        res.status(201).json({ message: "user deleted successfully" })
    } catch {
        res.status(500).json({ error: "Internal server error" })

    }
}