This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


------------------


/*
https://www.misterpki.com/netsh-http-add-sslcert/

run POWERSHELL as ADMIN

A) check existing certicates    ls cert:\LocalMachine\My
B) show installed certtificates

The following commands in PowerShell (run as admin) will create a root certificate and its associated trusted certificate:

1. We create a new root trusted cert:
$rootCert = New-SelfSignedCertificate -Subject 'CN=TestRootCA,O=TestRootCA,OU=TestRootCA' -KeyExportPolicy Exportable -KeyUsage CertSign,CRLSign,DigitalSignature -KeyLength 2048 -KeyUsageProperty All -KeyAlgorithm 'RSA' -HashAlgorithm 'SHA256'  -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider'

2. We create the cert from the root trusted cert chain:
New-SelfSignedCertificate -DnsName "localhost" -FriendlyName "MyCert" -CertStoreLocation "cert:\LocalMachine\My" -Signer $rootCert -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") -Provider "Microsoft Strong Cryptographic Provider" -HashAlgorithm "SHA256" -NotAfter (Get-Date).AddYears(10)

3. We copy the thumbprint returned by the last command, or alternatively   ls cert:\LocalMachine\My
(www.bexar.de)

4. (If neccesary) We remove the last association ip/port/cert:
netsh http delete sslcert ipport=0.0.0.0:3000

5. We associate the new certificate with any ip and your port, 3000 for example (the appid value does not matter, is any valid guid):
netsh http add sslcert ipport=0.0.0.0:3000 appid='{214124cd-d05b-4309-9af9-9caa44b2b74a}' certhash=E2924D13A1D0EEDDBD28B741FAA4F80539E46D77


6. Now, you must drag and drop the TestRootCA from the Personal/Certificates folder to Trusted Root Certification Authorities/Certificates.
These commands also resolve the error ERR_CERT_WEAK_SIGNATURE_ALGORITHM returned later by Google Chrome because the certificate is created with SHA256 instead of SHA1

7. In app/package.json  DEFINE "scripts": { "start": "set HTTPS=true&&react-scripts start", ...


FOR BACKEND SERVER (Jan 31, 2023)

8. create a new certificate in c:\workspace\sec for www.cashtop.de
New-SelfSignedCertificate -Subject "www.cashtop.de" -CertStoreLocation c:\workspace\sec


9. remove old certificate for backend port 81
netsh http delete sslcert ipport=0.0.0.0:81


10. bind new cert to Port 81 for backend, invent an app-id to bind it later, use the cert hash optained from   ls cert:\LocalMachine\My
netsh http add sslcert ipport=0.0.0.0:81   appid='{214524cd-d65b-4309-9af7-9caa48b2b79a}' certhash=20747ED182AA326887E674B41ACA78557484FF78

-------------------------------
A) INSTALL MKCERT 
npm install mkcert

B) GENERATE A CERTIFICATE-AUTHORITY
node .\node_modules\mkcert/src/cli.js create-ca

C) CREATE A CERTFICATE
node .\node_modules\mkcert/src/cli.js create-cert


*/
