#!/bin/bash

# This script adds all Firebase environment variables to Vercel
# Run with: bash add-env-vars.sh

echo "Adding environment variables to Vercel..."

# Note: You'll need to paste the value when prompted for each variable

npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo "Paste: AIzaSyAs5z8PBxvy8b_kaSb8sN0nBQfAAmfBIbg"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo "Paste: infinityhouse-1794f.firebaseapp.com"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "Paste: infinityhouse-1794f"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "Paste: infinityhouse-1794f.firebasestorage.app"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "Paste: 750858809775"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo "Paste: 1:750858809775:web:04971eb7dc21fed699bf5a"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production
echo "Paste: G-CWK7LG56ZP"
echo ""

npx vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production
echo "Paste: https://infinityhouse-1794f-default-rtdb.firebaseio.com"
echo ""

npx vercel env add GEMINI_API_KEY production
echo "Paste: AIzaSyAs5z8PBxvy8b_kaSb8sN0nBQfAAmfBIbg"
echo ""

echo "Done! Now redeploy with: npx vercel --prod"
