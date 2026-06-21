# Ishwari Belhekar Portfolio

Professional portfolio for Ishwari Belhekar, a B.Tech CSE (AI & ML) student focused on AI/ML, full stack development, data science, cybersecurity, NLP, and real-world software solutions.

## Files Changed

- `index.html` - updated About Me, Skills, Projects, SEO/meta tags, accessibility attributes, and contact form status area.
- `style.css` - added project-card enhancements, technology badges, category tags, responsive refinements, contact-form feedback styling, and reduced-motion support.
- `app.js` - improved typing roles, mobile navigation ARIA state, contact-form loading/success/error handling, and passive/reduced-motion behavior.
- `server.js` - strengthened the Nodemailer contact API with request size limits, rate limiting, input trimming, validation, HTML escaping, and plain-text email fallback.
- `README.md` - added setup and email configuration instructions.

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example`:

   ```bash
   copy .env.example .env
   ```

3. Fill in your email settings in `.env`.

4. Start the server:

   ```bash
   npm start
   ```

5. Open:-

   ```text
   http://localhost:3000
   ```

## Contact Form Email Configuration

The contact form uses a secure backend endpoint:

```text
POST /api/contact
```

It sends messages through Nodemailer using Gmail SMTP.

For Gmail:

1. Go to your Google Account security settings.
2. Enable 2-Step Verification.
3. Create an App Password for Mail.
4. Add the values to `.env`:

   ```env
   PORT=3000
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_TO=ishwaribelhekar11@gmail.com
   ```

Use the app password, not your normal Gmail password.

## Dependencies

No new dependencies were added. Existing dependencies:

- `express`
- `nodemailer`
- `cors`
- `dotenv`

## Deployment Notes

- Set the same environment variables on your hosting platform.
- Keep `.env` private and never commit it.
- Deploy as a Node.js app so `/api/contact` can run server-side.
- If deploying to a static-only host, the contact form backend will not work unless paired with a serverless function or backend service.
