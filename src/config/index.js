require('dotenv').config();
const nodeEnv=process.env.NODE_ENV||'development';
const isProd=nodeEnv==='production';
const jwtSecret=process.env.JWT_SECRET||'dev_fallback_secret_do_not_use_in_prod';
if(isProd&&(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)) throw new Error('JWT_SECRET must be set to at least 32 characters in production');
module.exports={
 port:parseInt(process.env.PORT,10)||3000,nodeEnv,isProd,
 jwt:{secret:jwtSecret,expiresIn:process.env.JWT_EXPIRES_IN||'7d'},
 db:{path:process.env.DB_PATH||'./data/sportlog.db'},
 rateLimit:{windowMs:parseInt(process.env.RATE_LIMIT_WINDOW_MS,10)||900000,max:parseInt(process.env.RATE_LIMIT_MAX,10)||100},
 corsOrigins:process.env.CORS_ORIGINS?process.env.CORS_ORIGINS.split(',').map(s=>s.trim()).filter(Boolean):[]
};
