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
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

// Mock data for users
const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Admin', department: 'IT', status: 'active' },
  { id: 2, name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'Reception', department: 'Front Desk', status: 'active' },
  { id: 3, name: 'Bob Brown', email: 'bob.brown@example.com', role: 'Security', department: 'Security', status: 'inactive' },
  { id: 4, name: 'Emily Taylor', email: 'emily.taylor@example.com', role: 'Employee', department: 'HR', status: 'active' },
];

// Mock data for system settings
const mockSettings = {
  visitorSettings: {
    requireApproval: true,
    autoNotifyHost: true,
    capturePhoto: true,
    printBadge: true
  },
  securitySettings: {
    enableWatchlistCheck: false,
    requireNDA: true,
    maxVisitDuration: 8,
    allowAfterHours: false
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    slackIntegration: false,
    teamsIntegration: false
  }
};

function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState(mockUsers);
  const [settings, setSettings] = useState(mockSettings);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({ 
    name: '', 
    email: '', 
    role: '', 
    department: '', 
    status: 'active' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setIsEditing(true);
    } else {
      setCurrentUser({ 
        name: '', 
        email: '', 
        role: '', 
        department: '', 
        status: 'active' 
      });
      setIsEditing(false);
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const handleSaveUser = () => {
    if (isEditing) {
      setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
    } else {
      const newUser = {
        ...currentUser,
        id: users.length + 1
      };
      setUsers([...users, newUser]);
    }
    handleCloseUserDialog();
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };

  // Count users by role
  const userCounts = {
    total: users.length,
    admin: users.filter(u => u.role === 'Admin').length,
    reception: users.filter(u => u.role === 'Reception').length,
    security: users.filter(u => u.role === 'Security').length,
    employee: users.filter(u => u.role === 'Employee').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Panel
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<PersonIcon />} label="User Management" />
          <Tab icon={<SecurityIcon />} label="System Settings" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
        </Tabs>
        <Divider />

        {/* User Management Tab */}
        {tabValue === 0 && (
          <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenUserDialog()}
              >
                New User
              </Button>
            </Box>

            {/* User Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">{userCounts.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Admins
                    </Typography>
                    <Typography variant="h4">{userCounts.admin}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Reception
                    </Typography>
                    <Typography variant="h4">{userCounts.reception}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Security
                    </Typography>
                    <Typography variant="h4">{userCounts.security}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Employees
                    </Typography>
                    <Typography variant="h4">{userCounts.employee}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.status === 'active'}
                              onChange={() => {
                                setUsers(users.map(u => {
                                  if (u.id === user.id) {
                                    return {
                                      ...u,
                                      status: u.status === 'active' ? 'inactive' : 'active'
                                    };
                                  }
                                  return u;
                                }));
                              }}
                              color="primary"
                            />
                          }
                          label={user.status === 'active' ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleOpenUserDialog(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* System Settings Tab */}
        {tabValue === 1 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Visitor Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visitorSettings.requireApproval}
                        onChange={(e) => handleSettingChange('visitorSettings', 'requireApproval', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Require Host Approval for Visitors"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visitorSettings.autoNotifyHost}
                        onChange={(e) => handleSettingChange('visitorSettings', 'autoNotifyHost', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Automatically Notify Host on Visitor Arrival"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visitorSettings.capturePhoto}
                        onChange={(e) => handleSettingChange('visitorSettings', 'capturePhoto', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Capture Visitor Photo"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visitorSettings.printBadge}
                        onChange={(e) => handleSettingChange('visitorSettings', 'printBadge', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Print Visitor Badge"
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Security Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.enableWatchlistCheck}
                        onChange={(e) => handleSettingChange('securitySettings', 'enableWatchlistCheck', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable AI Watchlist Check"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.requireNDA}
                        onChange={(e) => handleSettingChange('securitySettings', 'requireNDA', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Require NDA for Visitors"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Maximum Visit Duration (hours):
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={settings.securitySettings.maxVisitDuration}
                      onChange={(e) => handleSettingChange('securitySettings', 'maxVisitDuration', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 1, max: 24 } }}
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.allowAfterHours}
                        onChange={(e) => handleSettingChange('securitySettings', 'allowAfterHours', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Allow After-Hours Visits"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Notifications Tab */}
        {tabValue === 2 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Channels
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.emailNotifications}
                    onChange={(e) => handleSettingChange('notificationSettings', 'emailNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.smsNotifications}
                    onChange={(e) => handleSettingChange('notificationSettings', 'smsNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.slackIntegration}
                    onChange={(e) => handleSettingChange('notificationSettings', 'slackIntegration', e.target.checked)}
                    color="primary"
                  />
                }
                label="Slack Integration"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.teamsIntegration}
                    onChange={(e) => handleSettingChange('notificationSettings', 'teamsIntegration', e.target.checked)}
                    color="primary"
                  />
                }
                label="Microsoft Teams Integration"
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Templates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Visitor Arrival Template"
                      multiline
                      rows={3}
                      defaultValue="Hello {host}, your visitor {visitor} from {company} has arrived at {time} for {purpose}."
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Visitor Approval Request Template"
                      multiline
                      rows={3}
                      defaultValue="Hello {host}, {visitor} from {company} has requested a visit on {date} at {time} for {purpose}. Please approve or reject this request."
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog}>
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing 
              ? 'Update the user information below.'
              : 'Enter the user information to add them to the system.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser.name}
            onChange={handleUserInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={currentUser.email}
            onChange={handleUserInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={currentUser.role}
              label="Role"
              onChange={handleUserInputChange}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Reception">Reception</MenuItem>
              <MenuItem value="Security">Security</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="department"
            label="Department"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser.department}
            onChange={handleUserInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={currentUser.status}
              label="Status"
              onChange={handleUserInputChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
