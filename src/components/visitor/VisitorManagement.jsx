import { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

// Mock data for visitors
const mockVisitors = [
  { id: 1, name: 'John Doe', company: 'ABC Corp', host: 'Jane Smith', purpose: 'Meeting', status: 'checked-in', checkInTime: '09:30 AM', checkOutTime: null },
  { id: 2, name: 'Alice Johnson', company: 'XYZ Inc', host: 'Bob Brown', purpose: 'Interview', status: 'pre-registered', checkInTime: null, checkOutTime: null },
  { id: 3, name: 'Michael Wilson', company: 'Tech Solutions', host: 'Sarah Davis', purpose: 'Delivery', status: 'checked-out', checkInTime: '10:15 AM', checkOutTime: '11:45 AM' },
  { id: 4, name: 'Emily Taylor', company: 'Global Services', host: 'David Miller', purpose: 'Maintenance', status: 'checked-in', checkInTime: '08:45 AM', checkOutTime: null },
];

function VisitorManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [visitors, setVisitors] = useState(mockVisitors);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVisitor, setCurrentVisitor] = useState({ name: '', company: '', host: '', purpose: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (visitor = null) => {
    if (visitor) {
      setCurrentVisitor(visitor);
      setIsEditing(true);
    } else {
      setCurrentVisitor({ name: '', company: '', host: '', purpose: '' });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVisitor({ ...currentVisitor, [name]: value });
  };

  const handleSaveVisitor = () => {
    if (isEditing) {
      setVisitors(visitors.map(v => v.id === currentVisitor.id ? currentVisitor : v));
    } else {
      const newVisitor = {
        ...currentVisitor,
        id: visitors.length + 1,
        status: 'pre-registered',
        checkInTime: null,
        checkOutTime: null
      };
      setVisitors([...visitors, newVisitor]);
    }
    handleCloseDialog();
  };

  const handleDeleteVisitor = (id) => {
    setVisitors(visitors.filter(visitor => visitor.id !== id));
  };

  const handleCheckIn = (id) => {
    setVisitors(visitors.map(visitor => {
      if (visitor.id === id) {
        return {
          ...visitor,
          status: 'checked-in',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return visitor;
    }));
  };

  const handleCheckOut = (id) => {
    setVisitors(visitors.map(visitor => {
      if (visitor.id === id) {
        return {
          ...visitor,
          status: 'checked-out',
          checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return visitor;
    }));
  };

  // Filter visitors based on tab
  const filteredVisitors = visitors.filter(visitor => {
    if (tabValue === 0) return true; // All visitors
    if (tabValue === 1) return visitor.status === 'pre-registered';
    if (tabValue === 2) return visitor.status === 'checked-in';
    if (tabValue === 3) return visitor.status === 'checked-out';
    return true;
  });

  // Count visitors by status
  const visitorCounts = {
    total: visitors.length,
    preRegistered: visitors.filter(v => v.status === 'pre-registered').length,
    checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    checkedOut: visitors.filter(v => v.status === 'checked-out').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Visitor Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Visitor
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Visitors
              </Typography>
              <Typography variant="h3">{visitorCounts.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pre-registered
              </Typography>
              <Typography variant="h3">{visitorCounts.preRegistered}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Checked In
              </Typography>
              <Typography variant="h3">{visitorCounts.checkedIn}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Checked Out
              </Typography>
              <Typography variant="h3">{visitorCounts.checkedOut}</Typography>
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
          <Tab label="All Visitors" />
          <Tab label="Pre-registered" />
          <Tab label="Checked In" />
          <Tab label="Checked Out" />
        </Tabs>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check-in Time</TableCell>
                <TableCell>Check-out Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell>{visitor.name}</TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell>{visitor.host}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>
                    <Chip 
                      label={visitor.status} 
                      color={
                        visitor.status === 'checked-in' ? 'success' : 
                        visitor.status === 'pre-registered' ? 'primary' : 
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{visitor.checkInTime || '-'}</TableCell>
                  <TableCell>{visitor.checkOutTime || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(visitor)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteVisitor(visitor.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {visitor.status === 'pre-registered' && (
                      <IconButton size="small" color="success" onClick={() => handleCheckIn(visitor.id)}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    {visitor.status === 'checked-in' && (
                      <IconButton size="small" color="error" onClick={() => handleCheckOut(visitor.id)}>
                        <CancelIcon fontSize="small" />
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

      {/* Add/Edit Visitor Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Visitor' : 'Add New Visitor'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing 
              ? 'Update the visitor information below.'
              : 'Enter the visitor information to pre-register them.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentVisitor.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="company"
            label="Company"
            type="text"
            fullWidth
            variant="outlined"
            value={currentVisitor.company}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="host"
            label="Host"
            type="text"
            fullWidth
            variant="outlined"
            value={currentVisitor.host}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="purpose"
            label="Purpose of Visit"
            type="text"
            fullWidth
            variant="outlined"
            value={currentVisitor.purpose}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveVisitor} variant="contained">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VisitorManagement;
