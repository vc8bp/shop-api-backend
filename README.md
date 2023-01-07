<!-- PROJECT LOGO -->
<br />
<h1 align="center">
  <a href="https://github.com/Braineanear/EcommerceAPI">
    <img src="https://media.discordapp.net/attachments/912996760589316120/1061248750305157131/My_project-1.png?width=683&height=683" alt="Logo" width="300">
  </a>

  <h3 align="center">shop API</h3>
</h1>

<h4 align="center">built with NodeJS & MongoDB</h4>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Contents</summary>
  <ol>
    <li>
      <a href="#deployed-version">Demo</a>
    </li>
    <li>
      <a href="#key-features">Key Features</a>
    </li>
    <li>
      <a href="#build-with">Build With</a>
    </li>
    <li>
      <a href="#to-do">To Do</a>
    </li>
    <li>
      <a href="#installation">Installation</a>
    </li>
    <li>
      <a href="#known-bugs">Known Bugs</a>
    </li>
    <li>
      <a href="#contact">Contact</a>
    </li>

  </ol>
</details>

## Deployed Version

Live demo (Feel free to visit) 👉 :  <a href="https://e-commerce-a-p-i.herokuapp.com">Shop API</a>

## Key Features

* Authentication
  * Login [Public]
  * SignUp [Public]
  * Tokens [User]
* Password Management
  * Change Password [User]
  * Forgot Password [Public]
  * Reset Password  [Public]
* Email Management
  * Send Email for forgot password [User]
* User
  * Create New User [Admin]
  * Get All Users [Public]
  * Get User Data Using It's ID [Public]
  * Update User Details Using It's ID [User]
  * Delete User Using It's ID [Admin]
* Cart Services
  * Add Product To Cart [User]
  * Get Cart [User]
  * Delete Cart Item [User]
  * Delete Cart [User]
* Product Services
  * Search products using Keywords [Public]
  * Query products using Category [Public]
  * Query Product Using It's ID [Public]
  * Create new product [Seller]
  * Update Product Details [Seller]
  * Delete Product Using It's ID [User]

* Order Services
  * Create New Order [User]
  * Query Orders [User]
  * Query Order Using It's ID [User]
  * Update Order Status [Admin]
  * get all Orders [Admin]
* Category Services
  * Create New Category [User]
  * Query Categories [Public]
  * Query Category Using It's ID [Public]
  * Update Category Details [Admin]
  * Delete Category [Admin]


## Built With

List of any major frameworks used to build the project.

* [NodeJS](https://nodejs.org/) - JS runtime environment
* [ExpressJS](https://expressjs.com/) - The NodeJS framework used
* [MongoDB](https://www.mongodb.com/) - NoSQL Database uses JSON-like documents with optional schemas
* [Mongoose](https://mongoosejs.com/) - Object Data Modeling (ODM) library for MongoDB and NodeJS
* [Cors](https://www.npmjs.com/package/cors) - NodeJS package for providing a Connect/Express middleware that can be used to enable CORS with various options
* [Dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from a . env file into process. env
* [jsonwebtoken](https://jwt.io/) - Compact URL-safe means of representing claims to be transferred between two parties
* [Nodemailer](https://www.npmjs.com/package/nodemailer) - Easy as cake e-mail sending from your Node.js applications
* [Razorpay](https://www.npmjs.com/package/razorpay) - The razorpay Node library provides convenient access to the razorpay API from applications written in server-side JavaScript.
* [crypto-js](https://www.npmjs.com/package/crypto-js) - crypto-js which deals with an algorithm that performs data encryption and decryption. This is used for security purpose like user authentication where storing the password in Database in the encrypted form
* [nanoid]() - Nano ID is nano-sized unique string ID generator for JavaScript. It's truly small (130 bytes minified), URL-friendly



## To-do
  * manage Product Quanti
  * filter product Products by price, date, popularity
  * Add Product Color
  * Add Product Size
  * Delete Product Color
  * Delete Product Size
  * Add pagination
  * add favorites
  * add analytics for products 

## Installation

You can fork the app or you can git-clone the app into your local machine. Once done that, please install all the
dependencies by running
```
$ npm install
set your env variables
$ yarn run start
```

### Docker Installation 
You can fork the app or you can git-clone the app into your local machine. 

*Note:Set the environment variables up to date and setup the database environment and also you need install docker on your local machine*

```
$ docker build -t shopapi .
$ docker run --publish 4000:4000 shopapi
```

## Known Bugs
Feel free to email me at vc8bp3@gmail.com if you run into any issues or have questions, ideas or concerns.
Please enjoy and feel free to share your opinion, constructive criticism, or comments about my work. Thank you! 🙂

<!-- CONTACT -->
## Contact

Email - [vc8bp3@gmail.com]()

Project: [https://github.com/vc8bp/shop-api-backend](https://github.com/vc8bp/shop-api-backend)
