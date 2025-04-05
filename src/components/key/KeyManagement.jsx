import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  KeyboardReturn as ReturnIcon
} from '@mui/icons-material';

// Mock data for keys
const mockKeys = [
  { id: 1, keyName: 'Server Room', keyNumber: 'K001', area: 'IT Department', assignedTo: 'John Smith', status: 'checked-out', checkoutTime: '09:30 AM', returnTime: null, notes: 'Emergency access only' },
  { id: 2, keyName: 'Main Office', keyNumber: 'K002', area: 'Administration', assignedTo: null, status: 'available', checkoutTime: null, returnTime: null, notes: '' },
  { id: 3, keyName: 'Storage Room', keyNumber: 'K003', area: 'Warehouse', assignedTo: 'Alice Johnson', status: 'checked-out', checkoutTime: '08:45 AM', returnTime: null, notes: 'Return by end of day' },
  { id: 4, keyName: 'Conference Room', keyNumber: 'K004', area: 'Meeting Area', assignedTo: null, status: 'available', checkoutTime: null, returnTime: null, notes: '' },
];

function KeyManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [keys, setKeys] = useState(mockKeys);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [currentKey, setCurrentKey] = useState({ 
    keyName: '', 
    keyNumber: '', 
    area: '', 
    assignedTo: null, 
    status: 'available', 
    notes: '' 
  });
  const [checkoutPerson, setCheckoutPerson] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (key = null) => {
    if (key) {
      setCurrentKey(key);
      setIsEditing(true);
    } else {
      setCurrentKey({ 
        keyName: '', 
        keyNumber: '', 
        area: '', 
        assignedTo: null, 
        status: 'available', 
        notes: '' 
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenCheckoutDialog = (key) => {
    setCurrentKey(key);
    setCheckoutPerson('');
    setOpenCheckoutDialog(true);
  };

  const handleCloseCheckoutDialog = () => {
    setOpenCheckoutDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentKey({ ...currentKey, [name]: value });
  };

  const handleSaveKey = () => {
    if (isEditing) {
      setKeys(keys.map(k => k.id === currentKey.id ? currentKey : k));
    } else {
      const newKey = {
        ...currentKey,
        id: keys.length + 1,
        status: 'available',
        checkoutTime: null,
        returnTime: null
      };
      setKeys([...keys, newKey]);
    }
    handleCloseDialog();
  };

  const handleDeleteKey = (id) => {
    setKeys(keys.filter(key => key.id !== id));
  };

  const handleCheckout = () => {
    setKeys(keys.map(key => {
      if (key.id === currentKey.id) {
        return {
          ...key,
          status: 'checked-out',
          assignedTo: checkoutPerson,
          checkoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          returnTime: null
        };
      }
      return key;
    }));
    handleCloseCheckoutDialog();
  };

  const handleReturn = (id) => {
    setKeys(keys.map(key => {
      if (key.id === id) {
        return {
          ...key,
          status: 'available',
          assignedTo: null,
          returnTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return key;
    }));
  };

  // Filter keys based on tab
  const filteredKeys = keys.filter(key => {
    if (tabValue === 0) return true; // All keys
    if (tabValue === 1) return key.status === 'available';
    if (tabValue === 2) return key.status === 'checked-out';
    return true;
  });

  // Count keys by status
  const keyCounts = {
    total: keys.length,
    available: keys.filter(k => k.status === 'available').length,
    checkedOut: keys.filter(k => k.status === 'checked-out').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Key Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Key
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Keys
              </Typography>
              <Typography variant="h3">{keyCounts.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h3">{keyCounts.available}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Checked Out
              </Typography>
              <Typography variant="h3">{keyCounts.checkedOut}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Keys" />
          <Tab label="Available" />
          <Tab label="Checked Out" />
        </Tabs>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key Name</TableCell>
                <TableCell>Key Number</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Checkout Time</TableCell>
                <TableCell>Return Time</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.keyName}</TableCell>
                  <TableCell>{key.keyNumber}</TableCell>
                  <TableCell>{key.area}</TableCell>
                  <TableCell>
                    <Chip 
                      label={key.status} 
                      color={key.status === 'available' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{key.assignedTo || '-'}</TableCell>
                  <TableCell>{key.checkoutTime || '-'}</TableCell>
                  <TableCell>{key.returnTime || '-'}</TableCell>
                  <TableCell>{key.notes}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(key)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteKey(key.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {key.status === 'available' && (
                      <IconButton size="small" color="primary" onClick={() => handleOpenCheckoutDialog(key)}>
                        <KeyIcon fontSize="small" />
                      </IconButton>
                    )}
                    {key.status === 'checked-out' && (
                      <IconButton size="small" color="success" onClick={() => handleReturn(key.id)}>
                        <ReturnIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Key Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Key' : 'Add New Key'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing 
              ? 'Update the key information below.'
              : 'Enter the key information to add it to the system.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="keyName"
            label="Key Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentKey.keyName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="keyNumber"
            label="Key Number"
            type="text"
            fullWidth
            variant="outlined"
            value={currentKey.keyNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="area"
            label="Area/Location"
            type="text"
            fullWidth
            variant="outlined"
            value={currentKey.area}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={currentKey.notes}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveKey} variant="contained">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Key Dialog */}
      <Dialog open={openCheckoutDialog} onClose={handleCloseCheckoutDialog}>
        <DialogTitle>Checkout Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are checking out: <strong>{currentKey.keyName}</strong> ({currentKey.keyNumber})
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Assigned To"
            type="text"
            fullWidth
            variant="outlined"
            value={checkoutPerson}
            onChange={(e) => setCheckoutPerson(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckoutDialog}>Cancel</Button>
          <Button 
            onClick={handleCheckout} 
            variant="contained"
            disabled={!checkoutPerson}
          >
            Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KeyManagement;
