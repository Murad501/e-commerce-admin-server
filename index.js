const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("data is coming soon");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const customerCollections = client
      .db("e-commerce-admin")
      .collection("customers");

    const cartCollections = client.db("e-commerce-admin").collection("cart");

    const orderCollections = client.db("e-commerce-admin").collection("orders");
    const productCollections = client
      .db("e-commerce-admin")
      .collection("products");

    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productCollections.find(query).toArray();
      res.send(result);
    });

    //product
    app.post("/product", async (req, res) => {
      const product = req.body;
      const result = await productCollections.insertOne(product);
      res.send(result);
    });

    //products
    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productCollections.find(query).toArray();
      res.send(result);
    });

    //orders
    app.get("/orders", async (req, res) => {
      const query = {};
      const result = await orderCollections.find(query).toArray();
      res.send(result);
    });

    //cart
    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await cartCollections.insertOne(product);
      res.send(result);
    });

    app.get("/cart-products", async (req, res) => {
      const query = {};
      const result = await cartCollections.find(query).toArray();
      res.send(result);
    });

    app.get("/my-cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user: email };
      const cartProduct = await cartCollections.find(query).toArray();
      res.send(cartProduct);
    });

    app.put("/update-quantity/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = req.body.quantity;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { quantity: quantity },
      };
      const result = await cartCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/delete-cart-item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollections.deleteOne(query);
      res.send(result);
    });

    //customer
    app.post("/customer", async (req, res) => {
      const customer = req.body;
      const result = await customerCollections.insertOne(customer);
      res.send(result);
    });

    //customers
    app.get("/customers", async (req, res) => {
      const query = {};
      const result = await customerCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const addedUser = await customerCollections.findOne(query);
      if (addedUser) {
        return res.send({ acknowledged: true });
      }
      const result = await customerCollections.insertOne(user);
      res.send(result);
    });

    //save payment details
    app.put("/save-payment-details/:email", async (req, res) => {
      const { email } = req.params;
      const query = { email: email };
      const { paymentDetails } = req.body;
      const updateDoc = {
        $set: { paymentDetails: paymentDetails },
      };
      const result = await customerCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    //get payment details
    app.get("/payment-details/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const userDetails = await customerCollections.findOne(query);

      res.send({ paymentDetails: userDetails?.paymentDetails });
    });

    //handle-checkout
    app.post("/handle-checkout/", async (req, res) => {
      const { orders } = req.body;
      const query = { user: email };
      await cartCollections.deleteMany(query);
      const result = await orderCollections.insertMany(orders);
      res.send(result);
    });
    app.post("/handle-checkout-by/:id", async (req, res) => {
      const { id } = req.params;
      const { order } = req.body;
      const query = { _id: new ObjectId(id) };
      await cartCollections.deleteOne(query);
      const result = await orderCollections.insertOne(order);
      res.send(result);
    });

    //admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await customerCollections.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //jwt
    app.post("/jwt", async (req, res) => {
      const email = req.body.email;
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
        expiresIn: "7d",
      });
      res.send({ token });
    });
  } catch {}
};

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("server is running on port", port);
});
