# BloomWell - Video Consultation Setup

This document explains how to set up video consultation functionality for BloomWell using Daily.co.

## Required Dependencies

Install the following packages:

```bash
npm install axios @daily-co/daily-react @daily-co/daily-js
```

## Environment Variables

Add these to your `.env` file:

```env
# Daily.co API Configuration
DAILY_API_KEY=your_daily_co_api_key_here
```

## Features Implemented

### 1. Video Room API (`/api/video/room`)
- Creates secure video rooms using Daily.co API
- Rooms expire after 1 hour for security
- Supports chat, screen sharing, and knocking
- Handles both POST (create) and GET (list) requests

### 2. Video Call Component (`/components/VideoCall.tsx`)
- Full-featured video call interface
- Camera and microphone controls
- Screen sharing capability
- Error handling and loading states
- Responsive design

### 3. Video Consultation Page (`/app/video-consultation/page.tsx`)
- Lists available physicians
- One-click video call initiation
- Professional medical interface
- Mobile responsive design

### 4. Video Consultation Component (`/components/VideoConsultation.tsx`)
- Pre-call setup interface
- Physician information display
- Security and feature highlights
- Smooth transitions to video call

## How to Use

1. **Get Daily.co API Key**:
   - Sign up at [Daily.co](https://daily.co)
   - Create an account and get your API key
   - Add it to your `.env` file

2. **Access Video Consultation**:
   - Navigate to `/video-consultation` in your app
   - Select an available physician
   - Click "Start Video Call"
   - Grant camera/microphone permissions
   - Begin consultation

## Security Features

- **HIPAA Compliance**: Daily.co offers HIPAA-compliant plans
- **Secure Rooms**: Each room has unique URL and expiration
- **Authentication**: API key protected endpoints
- **Data Privacy**: No patient data stored in video system

## Integration with Existing Features

The video consultation integrates seamlessly with:
- Physician profiles from existing data
- BloomWell's design system
- Authentication system (can be extended)
- Consultation booking system

## Customization Options

### Room Configuration
Modify room properties in `/api/video/room/route.ts`:
```javascript
{
  properties: {
    exp: Math.floor(Date.now()/1000) + 3600, // 1 hour expiration
    enable_chat: true,
    enable_screenshare: true,
    enable_knocking: true,
    start_video_off: false,
    start_audio_off: false,
    lang: "en"
  }
}
```

### UI Customization
- Update colors in Tailwind classes
- Modify button styles and layouts
- Add custom branding elements
- Adjust responsive breakpoints

## Troubleshooting

### Common Issues
1. **API Key Error**: Ensure `DAILY_API_KEY` is set correctly
2. **Permission Denied**: Check browser camera/microphone permissions
3. **Connection Issues**: Verify internet connection and firewall settings
4. **Component Errors**: Ensure all dependencies are installed

### Error Handling
The system includes comprehensive error handling for:
- API failures
- Network issues
- Permission problems
- Browser compatibility

## Future Enhancements

Consider adding:
- Appointment scheduling integration
- Recording capabilities
- Waiting room functionality
- Multi-participant calls
- Integration with electronic health records
- Prescription management during calls

## Support

For Daily.co specific issues:
- [Daily.co Documentation](https://docs.daily.co/)
- [Daily.co Support](https://support.daily.co/)

For BloomWell integration issues:
- Check component props and API responses
- Verify environment variables
- Review browser console for errors
