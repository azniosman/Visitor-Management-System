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
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

// Mock data for shipments
const mockShipments = [
  { id: 1, trackingNumber: 'TRK123456789', carrier: 'FedEx', sender: 'ABC Corp', recipient: 'John Smith', type: 'Package', status: 'received', receivedTime: '09:30 AM', deliveredTime: null, notes: 'Fragile' },
  { id: 2, trackingNumber: 'TRK987654321', carrier: 'UPS', sender: 'XYZ Inc', recipient: 'Alice Johnson', type: 'Document', status: 'in-transit', receivedTime: '10:15 AM', deliveredTime: null, notes: 'Urgent' },
  { id: 3, trackingNumber: 'TRK456789123', carrier: 'DHL', sender: 'Global Services', recipient: 'Bob Brown', type: 'Package', status: 'delivered', receivedTime: '08:45 AM', deliveredTime: '11:30 AM', notes: '' },
  { id: 4, trackingNumber: 'TRK789123456', carrier: 'USPS', sender: 'Tech Solutions', recipient: 'Emily Taylor', type: 'Package', status: 'received', receivedTime: '14:20 PM', deliveredTime: null, notes: 'Heavy' },
];

function ShipmentTracking() {
  const [tabValue, setTabValue] = useState(0);
  const [shipments, setShipments] = useState(mockShipments);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentShipment, setCurrentShipment] = useState({ 
    trackingNumber: '', 
    carrier: '', 
    sender: '', 
    recipient: '', 
    type: '', 
    notes: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (shipment = null) => {
    if (shipment) {
      setCurrentShipment(shipment);
      setIsEditing(true);
    } else {
      setCurrentShipment({ 
        trackingNumber: '', 
        carrier: '', 
        sender: '', 
        recipient: '', 
        type: '', 
        notes: '' 
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentShipment({ ...currentShipment, [name]: value });
  };

  const handleSaveShipment = () => {
    if (isEditing) {
      setShipments(shipments.map(s => s.id === currentShipment.id ? currentShipment : s));
    } else {
      const newShipment = {
        ...currentShipment,
        id: shipments.length + 1,
        status: 'received',
        receivedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deliveredTime: null
      };
      setShipments([...shipments, newShipment]);
    }
    handleCloseDialog();
  };

  const handleDeleteShipment = (id) => {
    setShipments(shipments.filter(shipment => shipment.id !== id));
  };

  const handleMarkInTransit = (id) => {
    setShipments(shipments.map(shipment => {
      if (shipment.id === id) {
        return {
          ...shipment,
          status: 'in-transit'
        };
      }
      return shipment;
    }));
  };

  const handleMarkDelivered = (id) => {
    setShipments(shipments.map(shipment => {
      if (shipment.id === id) {
        return {
          ...shipment,
          status: 'delivered',
          deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return shipment;
    }));
  };

  // Filter shipments based on tab
  const filteredShipments = shipments.filter(shipment => {
    if (tabValue === 0) return true; // All shipments
    if (tabValue === 1) return shipment.status === 'received';
    if (tabValue === 2) return shipment.status === 'in-transit';
    if (tabValue === 3) return shipment.status === 'delivered';
    return true;
  });

  // Count shipments by status
  const shipmentCounts = {
    total: shipments.length,
    received: shipments.filter(s => s.status === 'received').length,
    inTransit: shipments.filter(s => s.status === 'in-transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shipment Tracking
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Shipment
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Shipments
              </Typography>
              <Typography variant="h3">{shipmentCounts.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Received
              </Typography>
              <Typography variant="h3">{shipmentCounts.received}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Transit
              </Typography>
              <Typography variant="h3">{shipmentCounts.inTransit}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Delivered
              </Typography>
              <Typography variant="h3">{shipmentCounts.delivered}</Typography>
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
          <Tab label="All Shipments" />
          <Tab label="Received" />
          <Tab label="In Transit" />
          <Tab label="Delivered" />
        </Tabs>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking Number</TableCell>
                <TableCell>Carrier</TableCell>
                <TableCell>Sender</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Received Time</TableCell>
                <TableCell>Delivered Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>{shipment.trackingNumber}</TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell>{shipment.sender}</TableCell>
                  <TableCell>{shipment.recipient}</TableCell>
                  <TableCell>{shipment.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={shipment.status} 
                      color={
                        shipment.status === 'received' ? 'primary' : 
                        shipment.status === 'in-transit' ? 'warning' : 
                        'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{shipment.receivedTime || '-'}</TableCell>
                  <TableCell>{shipment.deliveredTime || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(shipment)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteShipment(shipment.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {shipment.status === 'received' && (
                      <IconButton size="small" color="warning" onClick={() => handleMarkInTransit(shipment.id)}>
                        <ShippingIcon fontSize="small" />
                      </IconButton>
                    )}
                    {(shipment.status === 'received' || shipment.status === 'in-transit') && (
                      <IconButton size="small" color="success" onClick={() => handleMarkDelivered(shipment.id)}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small">
                      <QrCodeIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Shipment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Shipment' : 'Add New Shipment'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing 
              ? 'Update the shipment information below.'
              : 'Enter the shipment information to log it.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="trackingNumber"
            label="Tracking Number"
            type="text"
            fullWidth
            variant="outlined"
            value={currentShipment.trackingNumber}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Carrier</InputLabel>
            <Select
              name="carrier"
              value={currentShipment.carrier}
              label="Carrier"
              onChange={handleInputChange}
            >
              <MenuItem value="FedEx">FedEx</MenuItem>
              <MenuItem value="UPS">UPS</MenuItem>
              <MenuItem value="DHL">DHL</MenuItem>
              <MenuItem value="USPS">USPS</MenuItem>
              <MenuItem value="Amazon">Amazon</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="sender"
            label="Sender"
            type="text"
            fullWidth
            variant="outlined"
            value={currentShipment.sender}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="recipient"
            label="Recipient"
            type="text"
            fullWidth
            variant="outlined"
            value={currentShipment.recipient}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={currentShipment.type}
              label="Type"
              onChange={handleInputChange}
            >
              <MenuItem value="Package">Package</MenuItem>
              <MenuItem value="Document">Document</MenuItem>
              <MenuItem value="Pallet">Pallet</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={currentShipment.notes}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveShipment} variant="contained">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShipmentTracking;
