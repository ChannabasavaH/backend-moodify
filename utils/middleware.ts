import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import rateLimit from 'express-rate-limit';
import { AuthenticatedRequest } from './interfaces';
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? ''; 

export const client = new ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../API_KEYS/moodify_cloud_vision_api.json')
});

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
  
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

//middleware to upload image
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again after a minute' },
});

export const createRateLimiter = (requestsPerMinute: number) => {
  return rateLimit({
    windowMs: 60 * 1000,
    max: requestsPerMinute,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: `Rate limit of ${requestsPerMinute} requests per minute exceeded` }
  });
};

export const authenticateUser = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded === 'object' && decoded !== null && ('id' in decoded || 'userId' in decoded)) {
      (req as AuthenticatedRequest).user = {
        id: (decoded as any).id || (decoded as any).userId as string
      };
      
      next();
    } else {
      throw new Error('Invalid token payload');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
