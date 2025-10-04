import { getChannel } from '../config/rabbitmq';

export const startEmailConsumer = () => {
  const channel = getChannel();
  
  channel.consume('email_notifications', (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log('Sending email:', content);
      
      // Simulate email sending
      setTimeout(() => {
        console.log(`Email sent to: ${content.email}`);
        channel.ack(msg);
      }, 1000);
    }
  });
};