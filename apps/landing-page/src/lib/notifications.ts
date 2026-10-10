/**
 * Notification Service
 * Handles customer notifications via multiple channels
 */

interface NotificationData {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  orderNumber: string
  orderTotal: number
  orderStatus: string
  deliveryAddress?: string
  estimatedDelivery?: string
  trackingUrl?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

/**
 * Send order confirmation notification
 */
export async function sendOrderConfirmationNotification(data: NotificationData) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 [NOTIFICATION SERVICE] SENDING ORDER CONFIRMATION')
  console.log('[NOTIFICATION] Customer:', data.customerName)
  console.log('[NOTIFICATION] Order:', data.orderNumber)
  console.log('[NOTIFICATION] Total:', data.orderTotal, 'XAF')
  console.log('[NOTIFICATION] Email:', data.customerEmail || 'Not provided')
  console.log('[NOTIFICATION] Phone:', data.customerPhone || 'Not provided')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const notifications = []

  // Email notification
  if (data.customerEmail) {
    try {
      await sendEmailNotification({
        to: data.customerEmail,
        subject: `Order Confirmed - ${data.orderNumber}`,
        type: 'order_confirmation',
        data,
      })
      notifications.push('email')
      console.log('[NOTIFICATION] ✅ Email notification queued')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Email notification failed:', error)
    }
  }

  // SMS notification
  if (data.customerPhone) {
    try {
      await sendSMSNotification({
        to: data.customerPhone,
        message: `SuberFood: Your order ${data.orderNumber} is confirmed! Total: ${data.orderTotal} XAF. We'll notify you when it's ready for delivery. Track: ${data.trackingUrl}`,
      })
      notifications.push('sms')
      console.log('[NOTIFICATION] ✅ SMS notification queued')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ SMS notification failed:', error)
    }
  }

  // WhatsApp notification (future enhancement)
  // Currently logs to console for manual follow-up
  if (data.customerPhone) {
    console.log('[NOTIFICATION] 💬 WhatsApp message template:')
    console.log(`Hello ${data.customerName}! 🎉`)
    console.log(`Your SuberFood order #${data.orderNumber} is confirmed!`)
    console.log(`Total: ${data.orderTotal} XAF`)
    if (data.items) {
      console.log(`\nItems:`)
      data.items.forEach(item => {
        console.log(`- ${item.name} (${item.quantity}x) - ${item.price} XAF`)
      })
    }
    if (data.deliveryAddress) {
      console.log(`\nDelivery to: ${data.deliveryAddress}`)
    }
    console.log(`\nThank you for supporting local farmers! 🌱`)
  }

  console.log('[NOTIFICATION] Notifications sent:', notifications.join(', '))
  return notifications
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusNotification(data: NotificationData & { previousStatus: string }) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📬 [NOTIFICATION SERVICE] SENDING STATUS UPDATE')
  console.log('[NOTIFICATION] Order:', data.orderNumber)
  console.log('[NOTIFICATION] Status:', data.previousStatus, '→', data.orderStatus)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and is being prepared.',
    PROCESSING: 'Your order is being processed.',
    READY: 'Your order is ready for delivery!',
    DISPATCHED: 'Your order is on the way!',
    DELIVERED: 'Your order has been delivered. Enjoy your fresh products!',
    CANCELLED: 'Your order has been cancelled.',
  }

  const message = statusMessages[data.orderStatus] || `Your order status has been updated to ${data.orderStatus}`

  // SMS notification
  if (data.customerPhone) {
    try {
      await sendSMSNotification({
        to: data.customerPhone,
        message: `SuberFood Order ${data.orderNumber}: ${message}`,
      })
      console.log('[NOTIFICATION] ✅ Status SMS sent')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Status SMS failed:', error)
    }
  }

  // Email notification
  if (data.customerEmail) {
    try {
      await sendEmailNotification({
        to: data.customerEmail,
        subject: `Order Update - ${data.orderNumber}`,
        type: 'status_update',
        data: { ...data, statusMessage: message },
      })
      console.log('[NOTIFICATION] ✅ Status email sent')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Status email failed:', error)
    }
  }
}

/**
 * Send delivery notification with GPS tracking
 */
export async function sendDeliveryNotification(data: NotificationData & {
  driverName?: string
  driverPhone?: string
  estimatedArrival?: string
  liveTrackingUrl?: string
}) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚚 [NOTIFICATION SERVICE] SENDING DELIVERY NOTIFICATION')
  console.log('[NOTIFICATION] Order:', data.orderNumber)
  console.log('[NOTIFICATION] Driver:', data.driverName || 'TBD')
  console.log('[NOTIFICATION] ETA:', data.estimatedArrival || 'TBD')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (data.customerPhone) {
    const message = `SuberFood: Your order ${data.orderNumber} is out for delivery! ${
      data.driverName ? `Driver: ${data.driverName} (${data.driverPhone})` : ''
    }${data.liveTrackingUrl ? ` Track live: ${data.liveTrackingUrl}` : ''}`

    try {
      await sendSMSNotification({
        to: data.customerPhone,
        message,
      })
      console.log('[NOTIFICATION] ✅ Delivery SMS sent')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Delivery SMS failed:', error)
    }
  }
}

/**
 * Send email notification (integration placeholder)
 */
async function sendEmailNotification(params: {
  to: string
  subject: string
  type: string
  data: any
}) {
  // TODO: Integrate with email service (SendGrid, Mailgun, or AWS SES)
  console.log('[EMAIL] Would send email to:', params.to)
  console.log('[EMAIL] Subject:', params.subject)
  console.log('[EMAIL] Type:', params.type)
  console.log('[EMAIL] Data:', JSON.stringify(params.data, null, 2))

  // For now, just log. In production, integrate with email service:
  /*
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: 'orders@suberfood.com', name: 'SuberFood' },
      subject: params.subject,
      content: [{
        type: 'text/html',
        value: generateEmailTemplate(params.type, params.data),
      }],
    }),
  })
  */

  return Promise.resolve()
}

/**
 * Send SMS notification (integration placeholder)
 */
async function sendSMSNotification(params: {
  to: string
  message: string
}) {
  // TODO: Integrate with SMS service (Twilio, Africa's Talking, or Nexmo)
  console.log('[SMS] Would send SMS to:', params.to)
  console.log('[SMS] Message:', params.message)
  console.log('[SMS] Message length:', params.message.length, 'characters')

  // For now, just log. In production, integrate with SMS service:
  /*
  // Example for Africa's Talking (popular in Africa)
  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'apiKey': process.env.AFRICASTALKING_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: process.env.AFRICASTALKING_USERNAME,
      to: params.to,
      message: params.message,
    }),
  })
  */

  return Promise.resolve()
}

/**
 * Send referral commission notification
 */
export async function sendReferralCommissionNotification(data: {
  referrerName: string
  referrerEmail?: string
  referrerPhone?: string
  orderNumber: string
  commissionAmount: number
  newWalletBalance: number
}) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💰 [NOTIFICATION SERVICE] SENDING COMMISSION NOTIFICATION')
  console.log('[NOTIFICATION] Referrer:', data.referrerName)
  console.log('[NOTIFICATION] Order:', data.orderNumber)
  console.log('[NOTIFICATION] Commission:', data.commissionAmount, 'XAF')
  console.log('[NOTIFICATION] New Balance:', data.newWalletBalance, 'XAF')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (data.referrerPhone) {
    const message = `SuberFood: You earned ${data.commissionAmount} XAF commission from order ${data.orderNumber}! New wallet balance: ${data.newWalletBalance} XAF. Keep sharing! 🎉`

    try {
      await sendSMSNotification({
        to: data.referrerPhone,
        message,
      })
      console.log('[NOTIFICATION] ✅ Commission SMS sent')
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Commission SMS failed:', error)
    }
  }
}
