const { sendNotification } = require('../../../src/utils/notifications');
const { sendNotificationEmail } = require('../../../src/utils/email');

// Mock dependencies
jest.mock('../../../src/utils/email');

describe('Notifications Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console.log and console.warn to prevent test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock sendNotificationEmail
    sendNotificationEmail.mockResolvedValue({ messageId: 'mock-message-id' });
  });
  
  afterEach(() => {
    // Restore console methods
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });
  
  it('should send a visitor arrival notification', async () => {
    // Setup
    const options = {
      type: 'visitor_arrival',
      recipient: {
        _id: 'user-id',
        name: 'Host User',
        email: 'host@example.com',
        notificationPreferences: {
          email: true
        }
      },
      data: {
        visitorName: 'John Doe',
        company: 'ABC Corp',
        checkInTime: new Date().toISOString(),
        purpose: 'Meeting'
      }
    };
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).toHaveBeenCalledWith({
      recipient: options.recipient,
      subject: 'Visitor Arrival Notification',
      message: expect.stringContaining('John Doe')
    });
    
    expect(result).toEqual({
      type: 'visitor_arrival',
      recipient: 'user-id',
      subject: 'Visitor Arrival Notification',
      message: expect.any(String),
      sentAt: expect.any(Date)
    });
  });
  
  it('should send a shipment received notification', async () => {
    // Setup
    const options = {
      type: 'shipment_received',
      recipient: {
        _id: 'user-id',
        name: 'Recipient User',
        email: 'recipient@example.com',
        notificationPreferences: {
          email: true
        }
      },
      data: {
        sender: 'XYZ Inc',
        trackingNumber: 'TRK123456789'
      }
    };
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).toHaveBeenCalledWith({
      recipient: options.recipient,
      subject: 'Shipment Received Notification',
      message: expect.stringContaining('TRK123456789')
    });
    
    expect(result).toEqual({
      type: 'shipment_received',
      recipient: 'user-id',
      subject: 'Shipment Received Notification',
      message: expect.any(String),
      sentAt: expect.any(Date)
    });
  });
  
  it('should send a key checkout alert', async () => {
    // Setup
    const options = {
      type: 'key_checkout_alert',
      recipient: {
        _id: 'user-id',
        name: 'Security User',
        email: 'security@example.com',
        notificationPreferences: {
          email: true
        }
      },
      data: {
        keyName: 'Server Room',
        keyNumber: 'K001',
        assignedTo: {
          name: 'John Doe'
        },
        checkoutTime: new Date().toISOString()
      }
    };
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).toHaveBeenCalledWith({
      recipient: options.recipient,
      subject: 'Key Checkout Alert',
      message: expect.stringContaining('Server Room')
    });
    
    expect(result).toEqual({
      type: 'key_checkout_alert',
      recipient: 'user-id',
      subject: 'Key Checkout Alert',
      message: expect.any(String),
      sentAt: expect.any(Date)
    });
  });
  
  it('should handle missing recipient', async () => {
    // Setup
    const options = {
      type: 'visitor_arrival',
      recipient: null,
      data: {
        visitorName: 'John Doe'
      }
    };
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(console.warn).toHaveBeenCalledWith('Notification recipient not found');
    expect(sendNotificationEmail).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
  
  it('should respect notification preferences', async () => {
    // Setup
    const options = {
      type: 'visitor_arrival',
      recipient: {
        _id: 'user-id',
        name: 'Host User',
        email: 'host@example.com',
        phone: '+1234567890',
        notificationPreferences: {
          email: false,
          sms: true,
          slack: true,
          teams: false
        },
        slackUserId: 'slack-user-id'
      },
      data: {
        visitorName: 'John Doe',
        company: 'ABC Corp',
        checkInTime: new Date().toISOString(),
        purpose: 'Meeting'
      }
    };
    
    // Execute
    await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('SMS notification would be sent'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Slack notification would be sent'));
  });
  
  it('should handle email sending errors', async () => {
    // Setup
    const options = {
      type: 'visitor_arrival',
      recipient: {
        _id: 'user-id',
        name: 'Host User',
        email: 'host@example.com',
        notificationPreferences: {
          email: true
        }
      },
      data: {
        visitorName: 'John Doe',
        company: 'ABC Corp',
        checkInTime: new Date().toISOString(),
        purpose: 'Meeting'
      }
    };
    
    sendNotificationEmail.mockRejectedValue(new Error('Email error'));
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error sending email notification:', expect.any(Error));
    
    // Should still return a result even if email fails
    expect(result).toEqual({
      type: 'visitor_arrival',
      recipient: 'user-id',
      subject: 'Visitor Arrival Notification',
      message: expect.any(String),
      sentAt: expect.any(Date)
    });
  });
  
  it('should handle unknown notification type', async () => {
    // Setup
    const options = {
      type: 'unknown_type',
      recipient: {
        _id: 'user-id',
        name: 'User',
        email: 'user@example.com',
        notificationPreferences: {
          email: true
        }
      },
      data: {}
    };
    
    // Execute
    const result = await sendNotification(options);
    
    // Assert
    expect(sendNotificationEmail).toHaveBeenCalledWith({
      recipient: options.recipient,
      subject: 'Elisa Secure Access Notification',
      message: 'You have a new notification from Elisa Secure Access.'
    });
    
    expect(result).toEqual({
      type: 'unknown_type',
      recipient: 'user-id',
      subject: 'Elisa Secure Access Notification',
      message: expect.any(String),
      sentAt: expect.any(Date)
    });
  });
});
