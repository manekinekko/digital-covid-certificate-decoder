
## Digital Covid Certificate Decoder

An attempt to decode the Digital Covid Certificate (signed by the french app TousAntiCovid)

## How to use

If you want to try this yourself:
> In order to run this code, you will need [Node.js and NPM](https://nodejs.org/en/download/).

1. Use a scanner app on your phone to scan your **OWN** 2D-QR code
2. Copy the **2D-QR code** from the scanner app. It should look like this: `HC1:6BFO...`
3. Create a file called `pass.js` with the following content:
   ```javascript
   export const PASS = `REPLACE THIS WITH YOUR DATA`
   ```
4. Run `npm install`
5. Run `npm start`

## Disclaimers

This repository is for research purposes only, the use of this code is your responsibility.

I take NO responsibility and/or liability for how you choose to use any of the source code available here. By using any of the files available in this repository, you understand that you are AGREEING TO USE AT YOUR OWN RISK. Once again, ALL files available here are for EDUCATION and/or RESEARCH purposes ONLY.