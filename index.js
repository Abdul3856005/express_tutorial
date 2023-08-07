import express from "express";
const app = express();
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

mongoose.connect("mongodb://localhost:27017", {
    dbname: "backend",
}).then(() => console.log("database Connected")).catch((e) => console.log("error occured"));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema)

app.set("view engine", "ejs");



//middle ware
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const isAuthenitcated = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {

        const decoded = jwt.verify(token, "sddsfhjskjdf")
        req.user = await User.findById(decoded._id);
        next();
    }
    else {
        res.redirect("/login");
    }
}


app.get("/", isAuthenitcated, (req, res) => {
    res.render("logout", { name: req.user.name })
});

app.get("/register", (req, res) => {
    res.render("register")
});

app.get("/errmes",(req, res) =>{
    res.render("login")
});

app.post("/login", async(req, res) =>{
    const {email, password} = req.body;

     let user = await User.findOne({email});

     if (!user) return res.redirect("/register")
     

     const isMatch = user.password === password;

     if (!isMatch) return res.render( "errmes");

     const token = jwt.sign({ _id: user._id }, "sddsfhjskjdf");

     res.cookie("token", token, {
         httpOnly: true,
         expires: new Date(Date.now() + 60 * 1000),
     });
     res.redirect("/");

})


app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if  (user) {
         return res.redirect("/login")
    }

    user = await User.create({
        name,
        email,
        password,
    })

    const token = jwt.sign({ _id: user._id }, "sddsfhjskjdf");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");

});

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true, expires: new Date(Date.now()),
    });
    res.redirect("/");

});
app.get("/login",(req, res) =>{
    res.render("login")
});


app.listen(5000, () => {
    console.log("Server is working")
})