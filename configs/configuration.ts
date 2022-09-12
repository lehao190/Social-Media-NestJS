export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD || '',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    databaseName: process.env.DATABASE,
  },
  jwt: {
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  },
  session: {
    secret: process.env.SESSION_SECRET
  },
  firebaseCredentials: {
    bucket: process.env.FIREBASE_BUCKET
  }
});
