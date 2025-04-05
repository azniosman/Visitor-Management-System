const { sendNotificationEmail } = require('./email');

/**
 * Send a notification to a user through their preferred channels
 * @param {Object} options - Notification options
 * @param {string} options.type - Notification type
 * @param {Object} options.recipient - User object of the recipient
 * @param {Object} options.data - Data related to the notification
 * @returns {Promise} - Promise resolving when all notifications are sent
 */
exports.sendNotification = async (options) => {
  const { type, recipient, data } = options;
  
  // Skip if recipient doesn't exist
  if (!recipient) {
    console.warn('Notification recipient not found');
    return;
  }
  
  // Prepare notification content based on type
  let subject = '';
  let message = '';
  
  switch (type) {
    case 'visitor_arrival':
      subject = 'Visitor Arrival Notification';
      message = `Your visitor ${data.visitorName} from ${data.company} has arrived at ${new Date(data.checkInTime).toLocaleTimeString()} for ${data.purpose}.`;
      break;
      
    case 'visitor_checkout':
      subject = 'Visitor Checkout Notification';
      message = `Your visitor ${data.visitorName} from ${data.company} has checked out at ${new Date(data.checkOutTime).toLocaleTimeString()}.`;
      break;
      
    case 'visitor_approval_request':
      subject = 'Visitor Approval Request';
      message = `${data.visitorName} from ${data.company} has requested a visit on ${new Date(data.visitDate).toLocaleDateString()} at ${new Date(data.visitDate).toLocaleTimeString()} for ${data.purpose}. Please approve or reject this request.`;
      break;
      
    case 'shipment_received':
      subject = 'Shipment Received Notification';
      message = `A shipment from ${data.sender} with tracking number ${data.trackingNumber} has been received and is ready for pickup.`;
      break;
      
    case 'shipment_delivered':
      subject = 'Shipment Delivered Notification';
      message = `Your shipment with tracking number ${data.trackingNumber} has been delivered at ${new Date(data.deliveredTime).toLocaleTimeString()}.`;
      break;
      
    case 'key_checkout_alert':
      subject = 'Key Checkout Alert';
      message = `${data.assignedTo.name} has checked out the ${data.keyName} (${data.keyNumber}) key at ${new Date(data.checkoutTime).toLocaleTimeString()}.`;
      break;
      
    case 'key_returned':
      subject = 'Key Return Notification';
      message = `The ${data.keyName} (${data.keyNumber}) key has been returned at ${new Date(data.returnTime).toLocaleTimeString()}.`;
      break;
      
    case 'key_overdue':
      subject = 'Key Overdue Alert';
      message = `The ${data.keyName} (${data.keyNumber}) key checked out by ${data.assignedTo.name} is overdue for return. It was expected to be returned by ${new Date(data.expectedReturnTime).toLocaleString()}.`;
      break;
      
    default:
      subject = 'Elisa Secure Access Notification';
      message = 'You have a new notification from Elisa Secure Access.';
  }
  
  // Send notifications through enabled channels
  const promises = [];
  
  // Email notification
  if (recipient.notificationPreferences?.email) {
    promises.push(
      sendNotificationEmail({
        recipient,
        subject,
        message
      }).catch(error => {
        console.error('Error sending email notification:', error);
      })
    );
  }
  
  // SMS notification (would be implemented with a third-party service)
  if (recipient.notificationPreferences?.sms && recipient.phone) {
    // This would be implemented with a third-party SMS service
    console.log(`SMS notification would be sent to ${recipient.phone}: ${message}`);
  }
  
  // Slack notification (would be implemented with Slack API)
  if (recipient.notificationPreferences?.slack && recipient.slackUserId) {
    // This would be implemented with Slack API
    console.log(`Slack notification would be sent to ${recipient.slackUserId}: ${message}`);
  }
  
  // Teams notification (would be implemented with Microsoft Graph API)
  if (recipient.notificationPreferences?.teams && recipient.teamsUserId) {
    // This would be implemented with Microsoft Graph API
    console.log(`Teams notification would be sent to ${recipient.teamsUserId}: ${message}`);
  }
  
  // Wait for all notifications to be sent
  await Promise.all(promises);
  
  return {
    type,
    recipient: recipient._id,
    subject,
    message,
    sentAt: new Date()
  };
};
