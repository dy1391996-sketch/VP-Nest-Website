# VP Nest Website

Official static website for **VP Nest – The Studio99Stay**, a furnished-stay hospitality brand serving Greater Noida West.

## Live website

https://vp-nest-website.vercel.app/

## Current features

- Responsive multi-page website
- Official VP Nest brand system and logo family
- Furnished-stay and guest-service content
- WhatsApp-powered availability and booking enquiries
- Structured WhatsApp enquiry form with mobile and past-date validation
- Unique booking reference and campaign-source tracking in WhatsApp messages
- Six-step booking funnel, payment instructions and written-confirmation checklist
- Checkout review flow with a safely disabled Google review button until the verified URL is configured
- Verified business contact details and address
- SEO metadata, structured data, sitemap and robots rules
- Privacy, booking terms, payment-safety and custom 404 pages
- Vercel static deployment and security headers

## Run locally

```bash
python3 -m http.server 8000
```

Visit `http://localhost:8000`.

## Booking and payment safety

The website does not collect guest identity documents or payment details. Online payment checkout remains disabled until a secure server-side Razorpay order flow and verified live credentials are configured. Guests are instructed to confirm the studio, date, duration, amount and terms with the official team before payment.

## Campaign links

- Instagram: https://vp-nest-website.vercel.app/?source=instagram
- Google: https://vp-nest-website.vercel.app/?source=google
- WhatsApp Groups: https://vp-nest-website.vercel.app/?source=whatsapp
- Facebook: https://vp-nest-website.vercel.app/?source=facebook

## Google review configuration

Set `VP_NEST_CONFIG.googleReviewUrl` in `script.js` to the verified official Google review URL. Until this value is provided, the “Review VP Nest on Google” button remains disabled and no placeholder link is published.
