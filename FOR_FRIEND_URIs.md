# 🔌 URIs Your Friend Needs for WebSocket & Cloud Storage

## 📋 What to Send to Your Friend

### 1. **WebSocket/Backend URL** ✅ (You Already Have This)

```
https://weldiwinbackend-git-main-kaaboura12s-projects.vercel.app
```

**What it's for:**
- Frontend connects to this URL for WebSocket real-time messaging
- This is your Vercel deployment URL

**How to use in frontend:**
```javascript
import { io } from 'socket.io-client';

const socket = io('https://weldiwinbackend-git-main-kaaboura12s-projects.vercel.app', {
  auth: {
    token: 'user-jwt-token-here'
  }
});
```

---

### 2. **Cloud Storage URL** ⚠️ (You Need to Set This Up)

You need to choose a cloud storage service for audio files. Here are the options:

#### **Option 1: Cloudinary (Easiest - Recommended)**

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier available)
2. After signup, go to Dashboard
3. Copy your **Cloud Name** (e.g., `dabc123xyz`)
4. Your Cloud Storage URL will be:
   ```
   https://res.cloudinary.com/YOUR_CLOUD_NAME
   ```
   Example: `https://res.cloudinary.com/dabc123xyz`

**Send this to your friend:**
```
CLOUD_STORAGE_URL=https://res.cloudinary.com/YOUR_CLOUD_NAME
```

---

#### **Option 2: AWS S3**

1. Go to [aws.amazon.com/s3](https://aws.amazon.com/s3) and create an account
2. Create an S3 bucket
3. Enable public access (or configure CORS properly)
4. Your Cloud Storage URL will be:
   ```
   https://YOUR_BUCKET_NAME.s3.amazonaws.com
   ```
   Or with region:
   ```
   https://YOUR_BUCKET_NAME.s3.YOUR_REGION.amazonaws.com
   ```

**Send this to your friend:**
```
CLOUD_STORAGE_URL=https://YOUR_BUCKET_NAME.s3.amazonaws.com
```

---

#### **Option 3: Firebase Storage**

1. Go to [firebase.google.com](https://firebase.google.com) and create a project
2. Enable Storage
3. Your Cloud Storage URL will be:
   ```
   https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com
   ```

**Send this to your friend:**
```
CLOUD_STORAGE_URL=https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com
```

---

## 📝 Complete .env Values for Your Friend

Tell your friend to add these to their `.env` file:

```env
# WebSocket/Backend URL
BACKEND_URL=https://weldiwinbackend-git-main-kaaboura12s-projects.vercel.app

# Cloud Storage URL (choose one option above)
CLOUD_STORAGE_URL=https://res.cloudinary.com/YOUR_CLOUD_NAME
# OR
# CLOUD_STORAGE_URL=https://YOUR_BUCKET_NAME.s3.amazonaws.com
# OR
# CLOUD_STORAGE_URL=https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com
```

---

## ✅ Quick Summary to Send

**Copy and send this to your friend:**

```
Hi! Here are the URIs you need for the message system:

1. BACKEND_URL (WebSocket):
   https://weldiwinbackend-git-main-kaaboura12s-projects.vercel.app

2. CLOUD_STORAGE_URL (Audio Storage):
   [You need to set up Cloudinary/AWS S3/Firebase and send me the URL]
   
   Recommended: Cloudinary (easiest)
   - Sign up at cloudinary.com
   - Get your cloud name
   - URL format: https://res.cloudinary.com/YOUR_CLOUD_NAME

Add both to your .env file and Vercel environment variables.
```

---

## 🚀 Recommended: Use Cloudinary (Easiest Setup)

1. **Sign up**: [cloudinary.com/users/register](https://cloudinary.com/users/register)
2. **Get Cloud Name**: Dashboard → Account Details → Cloud Name
3. **Format**: `https://res.cloudinary.com/YOUR_CLOUD_NAME`
4. **Send to friend**: The complete URL

**Example:**
If your cloud name is `weldiwin-app`, send:
```
CLOUD_STORAGE_URL=https://res.cloudinary.com/weldiwin-app
```

