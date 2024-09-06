import loginSchema from "../schema/loginSchema.js";
import User from "../schema/userModule.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
dotenv.config();
const secretkey = process.env.SECRET_KEYS;

export const fetch = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const name = req.query.name || '';

        if (page <= 0 || limit <= 0) {
            return res.status(400).json({ error: "Page and limit must be positive integers" });
        }

        const searchFilter = name ? { name: new RegExp(name, 'i') } : {};

        const users = await User.find(searchFilter)
            .skip((page - 1) * limit)
            .limit(limit);

        const totalUsers = await User.countDocuments(searchFilter);

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const create = async (req, res) => {
    try {
        const userData = new User(req.body);
        const { email } = userData;
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const savedUser = await userData.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const signUp = async (req, res) => {

    //existing user check
    //hashed password
    //user creation
    //token generate

    const { username, email, password } = req.body;
    
    try {
        const existingUser = await loginSchema.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });

        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await loginSchema.create({
            email: email,
            password: hashedPassword,
            username: username
        });

        const token = jwt.sign({ email: result.email, id: result._id }, secretkey)
        res.status(201).json({
            User: result, token: token

        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const signIn = async (req, res) => {    

    const { email, password } = req.body;
    
    try {
        const existingUser = await loginSchema.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "user not found" });


        }
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id },secretkey)
        res.status(200).json({ user: existingUser, token: token })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }

}

