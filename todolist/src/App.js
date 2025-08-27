import React, { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import { contractABI, contractAddress } from "./abi";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConnectedMsg, setShowConnectedMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect to MetaMask - Web3.js
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        
        setAccount(accounts[0]);
        setWalletConnected(true);
        setShowWelcome(false);
        setShowConnectedMsg(true);

        // Hide connected message after 3 seconds
        setTimeout(() => setShowConnectedMsg(false), 3000);

        // Initialize Web3
        const web3Instance = new Web3(window.ethereum);
        
        // Initialize contract
        const todoContract = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(todoContract);
        
        // Load tasks after contract is set
        await loadTasksFromContract(todoContract, accounts[0]);
        
      } catch (error) {
        console.error("Wallet connection failed:", error);
        alert("Failed to connect wallet. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask extension.");
    }
  };

  // Load tasks - only show incomplete tasks
  const loadTasksFromContract = useCallback(async (todoContract = contract, fromAccount = account) => {
    if (!todoContract || !fromAccount) return;

    try {
      setLoading(true);
      
      console.log("Loading tasks from contract...");
      
      // Call smart contract function
      const total = await todoContract.methods.getTotalTasks().call();
      console.log("Total tasks:", total);
      
      const tasksArray = [];
      const totalNumber = parseInt(total);

      for (let i = 0; i < totalNumber; i++) {
        try {
          console.log(`Fetching task ${i}...`);
          
          // Try different ways to call getTask
          const taskData = await todoContract.methods.getTask(i).call();
          console.log(`Task ${i} data:`, taskData);
          
          let desc, completed;
          
          // Handle different return formats
          if (Array.isArray(taskData)) {
            // If it returns an array
            [desc, completed] = taskData;
          } else if (typeof taskData === 'object') {
            // If it returns an object
            desc = taskData.desc || taskData[0] || taskData.description;
            completed = taskData.completed || taskData[1] || taskData.isCompleted;
          } else {
            console.error(`Unexpected task data format:`, taskData);
            continue;
          }
          
          console.log(`Task ${i}: "${desc}", completed: ${completed}`);
          
          // Only add incomplete tasks to the array
          if (!completed) {
            tasksArray.push({ 
              id: i, 
              desc: desc || `Task ${i}`, 
              completed: false,
              timestamp: Date.now()
            });
          }
          
        } catch (taskError) {
          console.error(`Error loading task ${i}:`, taskError);
        }
      }

      console.log("Loaded tasks:", tasksArray);
      setTasks(tasksArray);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
      
      // If contract call fails, show sample data for testing
      if (error.message.includes("CONTRACT_NOT_DEPLOYED") || 
          error.message.includes("Invalid contract address") ||
          error.message.includes("Returned values aren't valid")) {
        
        console.warn("Contract seems not deployed. Showing sample data for testing.");
        setTasks([
          { id: 0, desc: "Sample Task 1", completed: false, timestamp: Date.now() },
          { id: 1, desc: "Sample Task 2", completed: false, timestamp: Date.now() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  const handleAddTask = async () => {
    if (!newTask.trim() || !contract || loading || !account) return;

    try {
      setLoading(true);
      
      console.log("Adding task:", newTask.trim());
      
      // Send transaction
      const result = await contract.methods.addTask(newTask.trim()).send({
        from: account,
        gas: 300000 // Gas limit
      });
      
      console.log("Task added successfully:", result);
      
      setNewTask("");
      await loadTasksFromContract(); // Reload tasks
      alert("Task added successfully!");
      
    } catch (error) {
      console.error("Failed to add task:", error);
      
      if (error.code === 4001) {
        alert("Transaction cancelled by user.");
      } else if (error.message.includes("gas")) {
        alert("Transaction failed due to gas issues. Please try again.");
      } else {
        alert("Failed to add task. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (index) => {
    if (!contract || loading || !account) return;

    try {
      setLoading(true);
      
      console.log("Completing task:", index);
      
      // Remove task from UI immediately for better UX
      setTasks(prev => prev.filter(task => task.id !== index));
      
      // Mark as completed in blockchain
      const result = await contract.methods.markCompleted(index).send({
        from: account,
        gas: 300000
      });
      
      console.log("Task marked as complete:", result);
      
      // Reload tasks to sync with blockchain
      await loadTasksFromContract();
      
    } catch (error) {
      console.error("Failed to mark complete:", error);
      alert("Failed to mark task as complete. Please try again.");
      // Reload tasks to restore UI state if blockchain operation failed
      await loadTasksFromContract();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWalletConnected(false);
          setAccount("");
          setContract(null);
          setTasks([]);
          setShowWelcome(true);
        } else {
          // User switched accounts
          setAccount(accounts[0]);
          if (contract) {
            await loadTasksFromContract(contract, accounts[0]);
          }
        }
      };

      const handleChainChanged = () => {
        // Reload page on network change
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup event listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [contract, loadTasksFromContract]);

  useEffect(() => {
    if (walletConnected && contract && account) {
      loadTasksFromContract();
    }
  }, [walletConnected, contract, account, loadTasksFromContract]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.icon}>🚀</span>
          DeTodo - Decentralized Tasks
          <span style={styles.icon}>📝</span>
        </h1>
        <p style={styles.subtitle}>Manage your tasks on the blockchain with Web3.js</p>
      </div>

      {/* Welcome Message */}
      {showWelcome && !walletConnected && (
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeIcon}>👋</div>
          <h2 style={styles.welcomeTitle}>Welcome to DeTodo!</h2>
          <p style={styles.welcomeText}>
            Your decentralized task manager powered by blockchain technology. 
            Connect your wallet to start managing your tasks securely and transparently.
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <span>Secure & Decentralized</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>⚡</span>
              <span>Fast & Reliable</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌐</span>
              <span>Blockchain Powered</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Success Message */}
      {showConnectedMsg && (
        <div style={styles.successMsg}>
          <div style={styles.successIcon}>✅</div>
          <div>
            <h3 style={styles.successTitle}>Wallet Connected Successfully!</h3>
            <p style={styles.successText}>You can now manage your decentralized tasks</p>
          </div>
        </div>
      )}

      {!walletConnected ? (
        <div style={styles.connectSection}>
          <button 
            style={{
              ...styles.connectButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }} 
            onClick={connectWallet}
            disabled={loading}
          >
            <span style={styles.buttonIcon}>🔗</span>
            {loading ? "Connecting..." : "Connect MetaMask Wallet"}
          </button>
          <p style={styles.connectNote}>
            Make sure you have MetaMask installed and connected to the correct network
          </p>
        </div>
      ) : (
        <div style={styles.appContainer}>
          <div style={styles.walletInfo}>
            <div style={styles.connectedBadge}>
              <span style={styles.statusDot}></span>
              Connected (Web3.js)
            </div>
            <div style={styles.accountInfo}>
              <span style={styles.accountLabel}>Account:</span>
              <span style={styles.accountAddress}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          </div>

          <div style={styles.taskSection}>
            <div style={styles.inputSection}>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  style={styles.taskInput}
                  placeholder="What needs to be done? ✨"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddTask()}
                  disabled={loading}
                />
                <button 
                  style={{
                    ...styles.addButton,
                    opacity: (loading || !newTask.trim()) ? 0.7 : 1,
                    cursor: (loading || !newTask.trim()) ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={handleAddTask}
                  disabled={loading || !newTask.trim()}
                >
                  <span style={styles.buttonIcon}>➕</span>
                  {loading ? "Adding..." : "Add Task"}
                </button>
              </div>
            </div>

            <div style={styles.tasksContainer}>
              <h3 style={styles.sectionTitle}>
                Your Pending Tasks ({tasks.length})
                <span style={styles.taskStats}>
                  • Click "Complete" to finish and remove tasks
                </span>
              </h3>

              {loading && (
                <div style={styles.loadingMsg}>
                  <div style={styles.spinner}>⏳</div>
                  Loading tasks from blockchain...
                </div>
              )}

              {!loading && tasks.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎉</div>
                  <h4 style={styles.emptyTitle}>All tasks completed!</h4>
                  <p style={styles.emptyText}>Add a new task to get started</p>
                </div>
              ) : (
                <div style={styles.taskList}>
                  {tasks.map((task) => (
                    <div key={task.id} style={styles.taskCard}>
                      <div style={styles.taskContent}>
                        <div style={styles.taskMain}>
                          <span style={styles.taskText}>
                            {task.desc}
                          </span>
                          <div style={styles.taskMeta}>
                            <span style={styles.timestamp}>
                              Added: {formatTime(task.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <div style={styles.taskActions}>
                          <button
                            style={{
                              ...styles.completeButton,
                              opacity: loading ? 0.7 : 1,
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => completeTask(task.id)}
                            disabled={loading}
                            title="Mark as complete and remove"
                          >
                            <span style={styles.buttonIcon}>✅</span>
                            {loading ? "Processing..." : "Complete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Powered by Ethereum Blockchain • Built with Web3.js • Secure & Decentralized
        </p>
      </footer>
    </div>
  );
}

// Same styles object...
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#ffffff",
  },
  header: {
    textAlign: "center",
    paddingTop: "40px",
    marginBottom: "30px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    margin: "0",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "18px",
    opacity: 0.9,
    margin: "10px 0 0 0",
    fontWeight: "300",
  },
  icon: {
    margin: "0 15px",
  },
  welcomeCard: {
    maxWidth: "600px",
    margin: "0 auto 30px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  welcomeIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "600",
    margin: "0 0 15px 0",
  },
  welcomeText: {
    fontSize: "16px",
    lineHeight: "1.6",
    opacity: 0.9,
    marginBottom: "30px",
  },
  features: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "20px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  featureIcon: {
    fontSize: "20px",
  },
  successMsg: {
    maxWidth: "500px",
    margin: "0 auto 30px",
    background: "rgba(40, 167, 69, 0.2)",
    border: "1px solid rgba(40, 167, 69, 0.5)",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    animation: "slideIn 0.5s ease-out",
  },
  successIcon: {
    fontSize: "30px",
  },
  successTitle: {
    margin: "0 0 5px 0",
    fontSize: "18px",
    fontWeight: "600",
  },
  successText: {
    margin: "0",
    fontSize: "14px",
    opacity: 0.9,
  },
  connectSection: {
    textAlign: "center",
    maxWidth: "400px",
    margin: "0 auto",
  },
  connectButton: {
    background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
    border: "none",
    borderRadius: "15px",
    padding: "18px 36px",
    fontSize: "18px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "0 auto",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  connectNote: {
    fontSize: "14px",
    opacity: 0.8,
    marginTop: "15px",
    fontStyle: "italic",
  },
  appContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 20px",
  },
  walletInfo: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  connectedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(40, 167, 69, 0.3)",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#28a745",
    animation: "pulse 2s infinite",
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  accountLabel: {
    fontSize: "14px",
    opacity: 0.8,
  },
  accountAddress: {
    fontSize: "16px",
    fontWeight: "600",
    background: "rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "8px",
    fontFamily: "monospace",
  },
  taskSection: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  inputSection: {
    marginBottom: "30px",
  },
  inputContainer: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  taskInput: {
    flex: 1,
    padding: "15px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "2px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    outline: "none",
    transition: "all 0.3s ease",
  },
  addButton: {
    background: "linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "15px 25px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  loadingMsg: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    fontSize: "24px",
    animation: "spin 1s linear infinite",
  },
  tasksContainer: {
    marginTop: "20px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  taskStats: {
    fontSize: "14px",
    fontWeight: "400",
    opacity: 0.8,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    opacity: 0.7,
  },
  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 10px 0",
  },
  emptyText: {
    fontSize: "16px",
    opacity: 0.8,
    margin: "0",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  taskCard: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "15px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  taskContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },
  taskMain: {
    flex: 1,
  },
  taskText: {
    fontSize: "18px",
    fontWeight: "500",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  taskMeta: {
    display: "flex",
    gap: "15px",
    marginTop: "8px",
  },
  timestamp: {
    fontSize: "12px",
    opacity: 0.6,
    fontStyle: "italic",
  },
  taskActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  completeButton: {
    background: "linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  buttonIcon: {
    fontSize: "14px",
  },
  footer: {
    textAlign: "center",
    padding: "40px 20px",
    marginTop: "50px",
  },
  footerText: {
    fontSize: "14px",
    opacity: 0.7,
    margin: "0",
  },
};

export default App;