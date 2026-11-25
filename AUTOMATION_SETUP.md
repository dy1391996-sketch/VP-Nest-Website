# VP Nest lead and WhatsApp automation setup

The website creates a WhatsApp message with the guest's stay details and a unique enquiry reference. It does not save booking details in browser storage or send them to a lead webhook. Nothing is submitted by the site; the guest sends the message from WhatsApp.

If adding CRM capture in the future, use a server-side integration and update the form notice and privacy policy to match the data actually collected. Do not put private API tokens in browser files.

## Automatic real-photo reply

Automatic photo delivery requires an approved WhatsApp Business API provider such as MSG91 or an equivalent provider.

1. Connect the booking and enquiry number `917827050079` to the provider. The official office number is `919211701998`.
2. Create an approved WhatsApp template acknowledging the enquiry reference.
3. In Make, Zapier or iZap, trigger the workflow from an incoming WhatsApp message.
4. Look up the available studio in Google Sheets or the booking system.
5. Send only verified media for that studio using provider-hosted media IDs or public HTTPS URLs.
6. Send the final price, timing and booking terms for manual confirmation.
7. Record delivery status against the enquiry reference.

The current website does not claim that photos or availability are sent automatically. Never enable that wording until the API flow has been tested on the official number.

## Analytics and reviews

- Add a valid GA4 ID to `analyticsId` in `config.js`.
- Add the verified Google review URL to `googleReviewUrl`.
- Add verified social profile URLs only; blank values should remain hidden.
