export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key',
  mail: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.MAIL_SENDER_EMAIL,
    senderName: process.env.MAIL_SENDER_NAME || '2FA Service',
  },
});