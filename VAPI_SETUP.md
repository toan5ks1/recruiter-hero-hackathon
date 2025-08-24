# Vapi AI Voice Interview Integration Setup

This guide will help you set up Vapi AI integration for AI-powered voice interviews in your application.

## Prerequisites

1. **Vapi Account**: Sign up at [vapi.ai](https://vapi.ai)
2. **API Keys**: Obtain your Vapi API key and public key from the dashboard
3. **Phone Number**: (Optional) Purchase a phone number for outbound calls

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Vapi AI Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here  # Optional for outbound calls
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here

# Your application URL (for webhook callbacks)
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # or http://localhost:3000 for development
```

### How to Get Your API Keys

1. **Login to Vapi Dashboard**: Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. **API Keys**: Navigate to Settings → API Keys
   - Copy your **Private API Key** → Use as `VAPI_API_KEY`
   - Copy your **Public Key** → Use as `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
3. **Phone Number** (Optional):
   - Go to Phone Numbers section
   - Purchase or configure a phone number
   - Copy the Phone Number ID → Use as `VAPI_PHONE_NUMBER_ID`

## Webhook Configuration

Configure webhooks in your Vapi dashboard to receive call events:

1. **Go to Webhooks** in Vapi dashboard
2. **Add Webhook URL**: `https://yourdomain.com/api/webhooks/vapi`
3. **Select Events**:
   - `call.started`
   - `call.ended`
   - `transcript`
   - `end-of-call-report`

### Local Development Webhook

For local development, use ngrok or similar tool:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the generated URL: https://abc123.ngrok.io/api/webhooks/vapi
```

## Testing the Integration

### 1. Create an Interview

1. Go to `/shortlist` in your application
2. Select a candidate and click "AI Call"
3. Schedule an interview (phone or link mode)
4. Verify that a Vapi assistant is created (check console logs)

### 2. Test Link Interview

1. Copy the generated interview link
2. Open it in a new browser tab
3. Go through the multi-step interview process
4. Click "Start Interview" to test the Vapi Web SDK integration

### 3. Test Phone Interview

1. Schedule a phone interview with a valid phone number
2. Click the phone button in the interview modal
3. Verify the outbound call is initiated through Vapi

## Features Included

### ✅ **Complete Voice Interview System**

#### **Web-Based Interviews (Link Mode)**

- Multi-step interview interface
- Real-time voice conversation with Vapi Web SDK
- Live transcript display
- Automatic interview recording

#### **Phone Interviews (Phone Mode)**

- Outbound call initiation through Vapi
- Automatic call management
- Call status tracking and updates

#### **AI Assistant Management**

- Automatic assistant creation for each interview
- Customized prompts based on job description
- Interview questions integration
- Professional voice configuration

#### **Comprehensive Tracking**

- Real-time call status updates via webhooks
- Full transcript storage
- Call recordings and summaries
- Cost tracking and analytics

### **Database Integration**

The system automatically tracks:

- ✅ Vapi assistant IDs
- ✅ Call IDs and status
- ✅ Transcripts and recordings
- ✅ Cost breakdown
- ✅ Interview summaries

### **API Endpoints**

- `POST /api/interviews` - Create interview with Vapi assistant
- `POST /api/interviews/[id]/start-call` - Initiate phone calls
- `POST /api/webhooks/vapi` - Handle Vapi webhook events
- `GET /api/interviews/[link]` - Get interview data for candidates

## Interview Flow

### **Recruiter Side:**

1. **Schedule Interview** → Creates Vapi assistant automatically
2. **Share Link** → Candidate gets interview link
3. **Monitor Progress** → Real-time status updates
4. **Review Results** → Transcript, recording, and AI analysis

### **Candidate Side:**

1. **Welcome** → Interview overview and job details
2. **Preparation** → System checks and interview tips
3. **Connecting** → AI system initialization
4. **Interview** → Live voice conversation with AI
5. **Completion** → Thank you and next steps

## Troubleshooting

### Common Issues

#### **"Failed to create interview"**

- Check `VAPI_API_KEY` is correctly set
- Verify Vapi account has sufficient credits
- Check console logs for specific error messages

#### **"Voice interface not ready"**

- Ensure `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set
- Check browser console for SDK loading errors
- Verify microphone permissions are granted

#### **Phone calls not working**

- Verify `VAPI_PHONE_NUMBER_ID` is configured
- Check phone number format (include country code)
- Ensure Vapi account has phone calling enabled

#### **Webhooks not receiving events**

- Verify webhook URL is publicly accessible
- Check webhook URL in Vapi dashboard
- Monitor webhook endpoint logs

### Debug Mode

Enable detailed logging by adding to your `.env`:

```bash
NODE_ENV=development
```

Check the following logs:

- **Browser Console**: Vapi Web SDK events
- **Server Console**: Assistant creation and webhook events
- **Vapi Dashboard**: Call logs and analytics

## Cost Considerations

### Pricing Factors

- **Voice Minutes**: $0.05-0.15 per minute depending on voice provider
- **LLM Tokens**: Based on OpenAI/Anthropic pricing
- **Phone Calls**: Additional charges for PSTN calling
- **Transcription**: Usually included in voice minute cost

### Cost Optimization

- Set reasonable `maxTokens` limits in assistant configuration
- Use shorter voice responses for cost efficiency
- Monitor usage through Vapi dashboard analytics

## Advanced Configuration

### Custom Voice Selection

Modify the assistant creation in `lib/vapi.ts`:

```typescript
voice: {
  provider: 'elevenlabs',
  voiceId: 'your_custom_voice_id', // Change voice
}
```

### Custom Model Configuration

Update the LLM model settings:

```typescript
model: {
  provider: 'openai',
  model: 'gpt-4o-mini', // or 'gpt-4o' for better quality
  temperature: 0.7,
  maxTokens: 200, // Adjust for cost control
}
```

### Interview Customization

The system automatically:

- Uses job description for context
- Includes custom interview questions
- Personalizes greeting with candidate name
- Configures appropriate interview duration

## Security Considerations

- ✅ **API Key Security**: Server-side keys never exposed to client
- ✅ **Link Validation**: Interview links expire after 7 days
- ✅ **User Authorization**: Only interview owners can manage calls
- ✅ **Webhook Verification**: Implement signature verification for production

## Production Deployment

### Required Steps:

1. Set production environment variables
2. Configure production webhook URL
3. Set up SSL certificates
4. Monitor webhook delivery
5. Set up error tracking and alerting

The integration is now ready for production use! 🎉
