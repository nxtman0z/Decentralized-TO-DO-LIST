# 🚀 DeTodo - Decentralized Todo List DApp

A **fully decentralized** todo list application built on **Ethereum blockchain** using **React.js** and **Web3.js**. Manage your tasks in a trustless, censorship-resistant environment with complete ownership of your data.

## 🔥 Live Demo

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20DeTodo-success?style=for-the-badge&logo=netlify&logoColor=white)](https://shiny-bubblegum-66dfc7.netlify.app/)



</div>

---

## ✨ Features

- 🔗 **Web3 Integration** - Connect with MetaMask wallet
- 📝 **Add Tasks** - Create new todo items on blockchain  
- ✅ **Complete Tasks** - Mark tasks as done immutably
- 🗑️ **Delete Tasks** - Remove unwanted tasks permanently
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Decentralized** - Your data lives on Ethereum blockchain
- ⚡ **Real-time Updates** - Instant UI updates after transactions
- 🎨 **Modern UI** - Clean and intuitive interface

## 🛠️ Tech Stack

- **Frontend:** React.js, CSS3, HTML5
- **Blockchain:** Solidity, Ethereum
- **Web3 Library:** Web3.js
- **Wallet:** MetaMask Integration
- **Deployment:** Netlify
- **Network:** Sepolia Testnet

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+ recommended)
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/nxtman0z/Decentralized-TO-DO-LIST.git

# Navigate to project directory
cd Decentralized-TO-DO-LIST/todolist

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup

Create a `.env` file in the `todolist` directory:

```env
REACT_APP_CONTRACT_ADDRESS=0x223755D3A0B60d96E8Bbaf081D1Fc9c14e3B2793
REACT_APP_NETWORK_ID=11155111
REACT_APP_NETWORK_NAME=Sepolia Testnet
REACT_APP_APP_NAME=DeTodo
REACT_APP_APP_VERSION=1.0.0
```

## 📱 How to Use

1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask connection
2. **Add Task** - Enter your task and click "Add Task"
3. **Complete Task** - Click the checkbox to mark task as completed
4. **Delete Task** - Click the delete button to remove task
5. **View History** - All tasks are permanently stored on blockchain

## 🏗️ Smart Contract

The DeTodo smart contract is deployed on **Sepolia Testnet**:

```solidity
// Contract Address: 0x223755D3A0B60d96E8Bbaf081D1Fc9c14e3B2793
// Network: Sepolia Testnet (Chain ID: 11155111)
// Explorer: https://sepolia.etherscan.io/
```

### Key Functions:
- `addTask(string memory _content)` - Add new task
- `completeTask(uint _id)` - Mark task as completed  
- `deleteTask(uint _id)` - Delete task
- `getTasks()` - Get all user tasks

## 📁 Project Structure

```
Decentralized-TO-DO-LIST/
├── todolist/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── contracts/
├── netlify.toml
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Build & Deploy

```bash
# Build production version
npm run build

# Deploy to Netlify
# Automatically deploys on push to main branch
```

## 🌐 Deployment

This project is automatically deployed on **Netlify** with the following configuration:

```toml
[build]
  base = "todolist"
  command = "npm run build"
  publish = "build"
```

<div align="center">

### 🚀 Try the Live Application

[![Deploy to Netlify](https://img.shields.io/badge/Deploy%20to-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://shiny-bubblegum-66dfc7.netlify.app/)

</div>

## 🔒 Security Features

- ✅ **Wallet-based Authentication** - Only wallet owner can manage their tasks
- ✅ **Immutable Storage** - Tasks stored permanently on blockchain
- ✅ **Decentralized** - No central server or database
- ✅ **Open Source** - Fully auditable code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Built with ❤️ by [@nxtman0z](https://github.com/nxtman0z)**

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-nxtman0z-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nxtman0z)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-DeTodo%20DApp-success?style=for-the-badge&logo=netlify&logoColor=white)](https://shiny-bubblegum-66dfc7.netlify.app/)

</div>

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) - Frontend framework
- [Web3.js](https://web3js.readthedocs.io/) - Ethereum JavaScript API
- [MetaMask](https://metamask.io/) - Crypto wallet integration
- [Netlify](https://netlify.com/) - Deployment platform
- [Ethereum](https://ethereum.org/) - Blockchain platform

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/nxtman0z/Decentralized-TO-DO-LIST)
![GitHub stars](https://img.shields.io/github/stars/nxtman0z/Decentralized-TO-DO-LIST)
![GitHub forks](https://img.shields.io/github/forks/nxtman0z/Decentralized-TO-DO-LIST)
![GitHub issues](https://img.shields.io/github/issues/nxtman0z/Decentralized-TO-DO-LIST)

<div align="center">

---

### 🌟 **Experience the Future of Todo Management**

[![Launch DeTodo](https://img.shields.io/badge/🚀%20Launch%20DeTodo-Click%20Here-FF6B6B?style=for-the-badge&labelColor=4ECDC4)](https://shiny-bubblegum-66dfc7.netlify.app/)

**⭐ Don't forget to star this repo if you found it helpful! ⭐**

</div>
