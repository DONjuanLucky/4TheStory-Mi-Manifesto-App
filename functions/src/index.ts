import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const db = admin.firestore();

// Note: Ensure 'gemini.api_key' is set in functions config:
// firebase functions:config:set gemini.api_key="YOUR_KEY"
const getApiKey = () => functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

// 1. Chat with voice agent
export const chatWithAgent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { projectId, userMessage, language } = data;
    const userId = context.auth.uid;
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new functions.https.HttpsError('internal', 'Gemini API key not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Verify project ownership
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get conversation history
    const conversationsRef = db
        .collection('projects')
        .doc(projectId)
        .collection('conversations')
        .orderBy('timestamp', 'desc')
        .limit(20);

    const conversationSnap = await conversationsRef.get();
    const history = conversationSnap.docs
        .reverse()
        .map(doc => ({
            role: doc.data().role,
            parts: [{ text: doc.data().content }]
        }));

    // Get project context
    const project = projectDoc.data();
    // Safe access to project since we checked existence
    const projectData = project || {};

    const userContextSnap = await db
        .collection('users')
        .doc(userId)
        .collection('context')
        .limit(1)
        .get();

    const userContext = userContextSnap.empty ? {} : userContextSnap.docs[0].data();

    // Build system instruction
    const systemInstruction = `You are a warm, encouraging, and deeply empathetic writing companion for Mi Manifesto, an app that helps people write their books.

Your role is to be like a trusted friend who genuinely cares about the user's creative journey. You are:
- Warm and conversational (never robotic or instructional)
- Curious and ask thoughtful follow-up questions
- Celebratory of progress, no matter how small
- Patient and non-judgmental
- Focused on the emotional and creative aspects of writing, not just the technical

Current project context:
- Book title: ${projectData.title || 'Untitled'}
- Genre: ${projectData.genre || 'Not specified'}
- Target word count: ${projectData.targetWordCount || 'Not set'}
- Current progress: ${projectData.currentWordCount || 0} words
- Language: ${language || 'English'}

User context:
- Writing style notes: ${userContext.writingStyleNotes || 'None yet'}
- Goals: ${userContext.goals?.join(', ') || 'Not specified'}
- Tone preference: ${userContext.tonePreference || 'balanced'}

Guidelines:
1. Always respond in ${language || 'the user\'s language'}
2. Reference previous conversations naturally
3. Ask open-ended questions that inspire creativity
4. Celebrate milestones enthusiastically
5. When user is stuck, help them talk through it rather than giving instructions
6. Remember character names, plot points, and themes from previous sessions
7. Be vulnerable and authentic yourself - share gentle insights
8. Never use lists or bullet points unless specifically asked
9. Keep responses conversational and flowing, like a friend talking

Conversation style examples:
- Instead of "What is your main character's name?" ask "Tell me about your main character - what drew you to them?"
- Instead of "You should write 500 words today" say "How are you feeling about writing today? What scene is calling to you?"
- When they complete a chapter: "This is incredible! You just finished a whole chapter. How does it feel? I'm so proud of you."`;

    // Generate response
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        systemInstruction
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    // Save conversation to Firestore
    const batch = db.batch();

    const userMessageRef = db
        .collection('projects')
        .doc(projectId)
        .collection('conversations')
        .doc();

    batch.set(userMessageRef, {
        role: 'user',
        content: userMessage,
        language: language || 'en',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const assistantMessageRef = db
        .collection('projects')
        .doc(projectId)
        .collection('conversations')
        .doc();

    batch.set(assistantMessageRef, {
        role: 'assistant',
        content: response,
        language: language || 'en',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update project last session
    batch.update(db.collection('projects').doc(projectId), {
        lastSessionAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return { response, language };
});

// 2. Detect language from audio/text
export const detectLanguage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { text } = data;
    const apiKey = getApiKey();
    if (!apiKey) throw new functions.https.HttpsError('internal', 'No API Key');

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(
        `Detect the language of this text and respond with ONLY the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de', 'zh', etc.): "${text}"`
    );

    const languageCode = result.response.text().trim().toLowerCase();
    return { language: languageCode };
});

// 3. Generate session summary
export const generateSessionSummary = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { projectId, sessionId } = data;
    const userId = context.auth.uid;
    const apiKey = getApiKey();
    if (!apiKey) throw new functions.https.HttpsError('internal', 'No API Key');

    // Verify ownership
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get session conversations
    const sessionDoc = await db
        .collection('projects')
        .doc(projectId)
        .collection('sessions')
        .doc(sessionId)
        .get();

    if (!sessionDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Session not found');
    }

    const transcript = sessionDoc.data()?.voiceTranscript || '';
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(
        `Summarize this writing session in 2-3 warm, encouraging sentences that capture what was discussed and accomplished. Write as if you're a supportive friend recapping the conversation:\n\n${transcript}`
    );

    const summary = result.response.text();

    // Update session with summary
    await db
        .collection('projects')
        .doc(projectId)
        .collection('sessions')
        .doc(sessionId)
        .update({ sessionSummary: summary });

    return { summary };
});
