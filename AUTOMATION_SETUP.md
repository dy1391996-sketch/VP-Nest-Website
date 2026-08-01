# VP Nest lead and WhatsApp automation setup

The website works without any paid API. Every completed enquiry is saved in the guest's browser and opens WhatsApp with a structured message and unique reference.

## Lead webhook

1. Create a webhook in Make, Zapier, iZap or your CRM.
2. Connect the webhook to Google Sheets or your lead database.
3. Set `leadWebhookUrl` in `config.js` to the public webhook URL.
4. Map these fields: enquiryReference, name, phone, checkinDate, checkinTime, duration, guests, budget, preference, purpose, request, recommendation, source, pageUrl and createdTimestamp.

Do not put private API tokens in `config.js` or any browser file.

## Automatic real-photo reply

Automatic photo delivery requires an approved WhatsApp Business API provider such as MSG91 or an equivalent provider.

1. Connect the official number `917827050079` to the provider.
2. Create an approved WhatsApp template acknowledging the enquiry reference.
3. In Make, Zapier or iZap, trigger the workflow from the lead webhook.
4. Look up the available studio in Google Sheets or the booking system.
5. Send only verified media for that studio using provider-hosted media IDs or public HTTPS URLs.
6. Send the final price, timing and booking terms for manual confirmation.
7. Record delivery status against the enquiry reference.

The current website does not claim that photos or availability are sent automatically. Never enable that wording until the API flow has been tested on the official number.

## Analytics and reviews

- Add a valid GA4 ID to `analyticsId` in `config.js`.
- Add the verified Google review URL to `googleReviewUrl`.
- Add verified social profile URLs only; blank values should remain hidden.
