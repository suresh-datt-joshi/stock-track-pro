# 📈 StockTrack Pro - Real-Time Portfolio Manager

**StockTrack Pro** is a modern, feature-rich web application designed for investors to effortlessly track their stock portfolios, monitor market movements, and analyze performance in real-time.


<img width="1904" height="920" alt="Screenshot 2025-08-19 224208" src="https://github.com/user-attachments/assets/9fa7417a-59da-4a61-b5d1-a5d9a29dbaa0" />


---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Built With](#built-with)
- [Deploy Your Own](#Deploy-Your-Own)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

---

## 🌟 About The Project

In today's fast-paced market, investors often manage assets across multiple brokerage accounts, making it difficult to get a holistic view of their portfolio's performance. StockTrack Pro was created to solve this problem by providing a single, intuitive dashboard to consolidate and visualize all your stock investments. This application empowers users to make data-driven decisions by presenting complex financial information in a clear and accessible way.

---

## ✨ Key Features

* **Real-Time Stock Data:** Fetches and displays up-to-the-minute stock prices and market data.
* **Dynamic Portfolio Management:** Easily add, edit, and delete stock holdings. Instantly see your total portfolio value, daily gains/losses, and overall returns.
* **Interactive Historical Charts:** Visualize stock performance over various timeframes (1D, 1W, 1M, 1Y) with beautiful, responsive charts.
* **Personalized Watchlist:** Keep a close eye on stocks you're interested in without adding them to your main portfolio.
* **Secure User Authentication:** Implements secure user registration and login using JWT to protect your financial data.
* **Fully Responsive Design:** Delivers a seamless and consistent user experience across desktops, tablets, and mobile devices.

---

## 📸 Screenshots

**➡️ [Click here to view the full application screenshot gallery.](./SCREENSHOTS.md)**

---

## 🛠️ Built With

This project leverages a modern and powerful tech stack for a robust and scalable application.

**Frontend:**
* [React.js](https://reactjs.org/) - A JavaScript library for building user interfaces.
* [Redux Toolkit](https://redux-toolkit.js.org/) - For efficient and predictable state management.
* [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
* [Recharts](https://recharts.org/) - For creating beautiful and interactive charts.
* [Axios](https://axios-http.com/) - For making promise-based HTTP requests.

**Backend:**
* [Node.js](https://nodejs.org/) - A JavaScript runtime environment.
* [Express.js](https://expressjs.com/) - A minimal and flexible Node.js web application framework.
* [MongoDB](https://www.mongodb.com/) - A NoSQL database for storing user and portfolio data.
* [Mongoose](https://mongoosejs.com/) - An elegant MongoDB object modeling tool for Node.js.
* [JSON Web Tokens (JWT)](https://jwt.io/) - For implementing secure authentication.

---

## 🚀 Deploy Your Own

You can easily deploy your own instance of this application. It is compatible with several major cloud platforms:

**Vercel:** The easiest way to deploy modern frontend applications.

**Netlify:** A great choice for static sites and Jamstack projects.

**Render:** A flexible platform that can host web services, static sites, and databases.

**Heroku:** A classic and powerful platform for a wide variety of applications.

---

## 🏁 Getting Started

Follow these instructions to set up a local copy of the project for development and testing purposes.

### Prerequisites

Ensure you have the following software installed on your local machine:

* Node.js (v18.x or later recommended)
* npm (Node Package Manager) or yarn
* Git for version control

### Installation

1.  **Clone the Repository**
    ```sh
    git clone [https://github.com/suresh-datt-joshi/stock-track-pro.git]
    ```

2.  **Navigate to the Project Directory**
    ```sh
    cd stock-track-pro
    ```

3.  **Install Backend Dependencies**
    ```sh
    cd server
    npm install
    ```

4.  **Install Frontend Dependencies**
    ```sh
    cd ../client
    npm install
    ```

5.  **Set Up Environment Variables**
    Create a `.env` file in the `server` directory and add the following configuration variables. You will need to sign up for the respective services to get the necessary keys.
    ```env
    # /server/.env

    # MongoDB Connection String
    MONGO_URI="[Your_MongoDB_Connection_String]"

    # JWT Secret Key for Authentication
    JWT_SECRET="[Your_Super_Secret_Key]"

    # API Key for Financial Data Provider
    FINNHUB_API_KEY="[Your_Finnhub_or_Other_API_Key]"

    # Server Port
    PORT=5000
    ```

6.  **Run the Application**
    You can run the frontend and backend servers concurrently from the root directory.

    * **Run the Backend Server (from `/server`):**
        ```sh
        npm run dev
        ```
    * **Run the Frontend Development Server (from `/client`):**
        ```sh
        npm start
        ```

    The application should now be running locally at `http://localhost:3000`.

---

## 📖 Usage

After launching the application:
1.  **Register** for a new account using a valid email and password.
2.  **Login** to access your dashboard.
3.  Use the **Search Bar** to find stocks by their ticker symbol (e.g., `AAPL`, `TSLA`).
4.  From the search results, **add stocks** to either your portfolio or your watchlist.
5.  When adding to the portfolio, specify the number of shares and the purchase price.
6.  Your dashboard will automatically update to reflect your new holdings and overall performance.

---

## 🌐 API Reference

This project relies on the **[Finnhub Stock API](https://finnhub.io/)** for real-time and historical stock market data.

* A free API key is required from their website.
* The key should be added to your `.env` file in the `server` directory.
* Be mindful of the API rate limits on the free tier to avoid service interruptions.

---

## 🗺️ Roadmap

-   [ ] Implement dividend tracking feature.
-   [ ] Add support for cryptocurrency tracking.
-   [ ] Introduce advanced portfolio analytics (e.g., sector allocation, risk analysis).
-   [ ] Develop a mobile app using React Native.

See the [open issues](https://github.com/suresh-datt-joshi/stock-track-pro/issues) for a full list of proposed features (and known issues).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1.  **Fork** the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a **Pull Request**

---

## 📜 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

---

## 📧 Contact

Suresh Datt Joshi - sureshdj9632@gmail.com

Project Link: [https://github.com/suresh-datt-joshi/stock-track-pro](https://github.com/suresh-datt-joshi/stock-track-pro)

---

## 🙏 Acknowledgements

* [Choose an Open Source License](https://choosealicense.com)




