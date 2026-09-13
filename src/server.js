const config = require('./config');
const express=require('express'), cors=require('cors'), helmet=require('helmet'), compression=require('compression'), morgan=require('morgan'), rateLimit=require('express-rate-limit'), path=require('path'), fs=require('fs');
require('./db');
const authRoutes=require('./routes/auth'), achievementRoutes=require('./routes/achievements'), statsRoutes=require('./routes/stats'), healthRoutes=require('./routes/health');
const {notFound,errorHandler}=require('./middleware/errorHandler');
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));
const corsOpts=config.corsOrigins.length?{origin:config.corsOrigins,credentials:true}:{origin:true};
app.use(cors(corsOpts));
app.use('/auth',rateLimit({windowMs:config.rateLimit.windowMs,max:config.rateLimit.max,standardHeaders:true,legacyHeaders:false,message:{success:false,error:'Too many requests — try again later'}}));
app.use(express.json({limit:'1mb'}));
app.use(compression());
app.use(morgan(config.isProd?'combined':'dev'));
const publicDir=path.join(__dirname,'..','public');
const indexFile=path.join(publicDir,'index.html');

// Always inject the runtime reliability layer into the app shell. This prevents
// duplicate/slow Stats requests from leaving the dashboard stuck on a spinner.
app.get(['/', '/index.html'], (req,res,next)=>{
  fs.readFile(indexFile,'utf8',(err,html)=>{
    if(err) return next(err);
    const script='<script src="js/stability.js"></script>';
    const output=html.includes('js/stability.js')?html:html.replace('</body>',`${script}</body>`);
    res.type('html');
    if(!config.isProd) res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(output);
  });
});

app.use(express.static(publicDir,{maxAge:config.isProd?'1d':0,setHeaders:(res,filePath)=>{if(!config.isProd && /\.(html|js|css)$/.test(filePath)){res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0')}}}));
app.use('/health',healthRoutes); app.use('/auth',authRoutes); app.use('/achievements',achievementRoutes); app.use('/stats',statsRoutes);
app.get('*',(req,res,next)=>{if(/^\/(auth|achievements|stats|health)(\/|$)/.test(req.path)) return next(); res.sendFile(indexFile,{headers:config.isProd?undefined:{'Cache-Control':'no-store, no-cache, must-revalidate, proxy-revalidate','Pragma':'no-cache','Expires':'0'}},err=>err&&next(err));});
app.use(notFound); app.use(errorHandler);
if(require.main===module) app.listen(config.port,()=>console.log(`SportLog running on port ${config.port}`));
module.exports=app;
