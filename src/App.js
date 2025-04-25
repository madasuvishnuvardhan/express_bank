import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  AccountBalance,
  SwapHoriz,
  History,
  AdminPanelSettings
} from '@mui/icons-material';
import { Bank } from './utils/BankingStructures.js';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5'
    }
  }
});

function App() {
  const [bank] = useState(new Bank());
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword] = useState('admin123'); // In real app, this should be properly secured
  const [transactionHistory, setTransactionHistory] = useState([]);

  const handleAdminLogin = (event) => {
    event.preventDefault();
    const password = event.target.password.value;
    if (password === adminPassword) {
      setIsAdmin(true);
      setMessage('Admin login successful');
    } else {
      setMessage('Invalid admin password');
    }
    event.target.reset();
  };

  const handleCreateAccount = (event) => {
    event.preventDefault();
    const accountNumber = parseInt(event.target.accountNumber.value);
    const balance = parseFloat(event.target.balance.value);
    const customerName = event.target.customerName.value;
    
    try {
      bank.addAccount(accountNumber, balance, customerName);
      setMessage(`Account ${accountNumber} created successfully for ${customerName}`);
      event.target.reset();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleTransfer = (event) => {
    event.preventDefault();
    const fromAccount = parseInt(event.target.fromAccount.value);
    const toAccount = parseInt(event.target.toAccount.value);
    const amount = parseFloat(event.target.amount.value);

    try {
      bank.transfer(fromAccount, toAccount, amount);
      setMessage(`Successfully transferred ${amount} from ${fromAccount} to ${toAccount}`);
      event.target.reset();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCheckHistory = (event) => {
    event.preventDefault();
    const accountNumber = parseInt(event.target.accountNumber.value);
    try {
      const history = bank.getTransactionHistory(accountNumber);
      setTransactionHistory(history);
      setMessage(`Transaction history retrieved for account ${accountNumber}`);
    } catch (error) {
      setMessage(error.message);
      setTransactionHistory([]);
    }
  };

  const renderAdminDashboard = () => {
    const accounts = bank.getAllAccounts();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Admin Dashboard</Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Accounts
                </Typography>
                <Typography variant="h4">
                  {accounts.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Balance
                </Typography>
                <Typography variant="h4">
                  ₹{totalBalance.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.accountNumber}>
                  <TableCell>{acc.accountNumber}</TableCell>
                  <TableCell>{acc.customerName}</TableCell>
                  <TableCell>₹{acc.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(acc.lastUpdated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const TabPanel = ({ children, value, index }) => (
    <Box sx={{ p: 3 }} hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <AccountBalance sx={{ mr: 2 }} />
              <Typography variant="h5" component="h1">
                Express Banking System
              </Typography>
              {!isAdmin && (
                <Box sx={{ ml: 'auto' }}>
                  <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px' }}>
                    <TextField
                      type="password"
                      name="password"
                      size="small"
                      placeholder="Admin Password"
                      variant="outlined"
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                    >
                      Admin Login
                    </Button>
                  </form>
                </Box>
              )}
            </Box>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ bgcolor: 'transparent' }}
            >
              <Tab icon={<AccountBalance />} label="Create Account" value="create" />
              <Tab icon={<SwapHoriz />} label="Transfer Money" value="transfer" />
              <Tab icon={<History />} label="Transaction History" value="history" />
              {isAdmin && (
                <Tab icon={<AdminPanelSettings />} label="Admin Dashboard" value="admin" />
              )}
            </Tabs>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <TabPanel value={activeTab} index="create">
              <Typography variant="h6" gutterBottom>Create New Account</Typography>
              <form onSubmit={handleCreateAccount}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="customerName"
                      label="Customer Name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="accountNumber"
                      label="6-digit Account Number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="balance"
                      label="Initial Balance (min ₹500)"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Create Account
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={activeTab} index="transfer">
              <Typography variant="h6" gutterBottom>Transfer Money</Typography>
              <form onSubmit={handleTransfer}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="fromAccount"
                      label="From Account"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="toAccount"
                      label="To Account"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      name="amount"
                      label="Amount"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Transfer
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={activeTab} index="history">
              <Typography variant="h6" gutterBottom>Transaction History</Typography>
              <form onSubmit={handleCheckHistory}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      name="accountNumber"
                      label="Account Number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      View History
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {transactionHistory.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>From Account</TableCell>
                        <TableCell>To Account</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date & Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>
                            <Typography
                              color={transaction.type === 'DEPOSIT' ? 'success.main' : 
                                     transaction.type === 'TRANSFER' ? 'primary.main' : 'error.main'}
                            >
                              {transaction.type}
                            </Typography>
                          </TableCell>
                          <TableCell>{transaction.fromAccount || '-'}</TableCell>
                          <TableCell>{transaction.toAccount}</TableCell>
                          <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(transaction.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index="admin">
              {isAdmin && renderAdminDashboard()}
            </TabPanel>

            {message && (
              <Alert 
                severity="info" 
                sx={{ mt: 2 }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
