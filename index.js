// MIT - 2021 Wassim Chegham

import { Certificate } from "@fidm/x509";
import { decode as _decode } from "base45-js";
import { decode } from "cbor";
import { sign } from "cose-js";
import { inflate } from "pako";
import { createHash as rawHash } from "sha256-uint8array";
import * as util from "util";

import { PASS } from "./pass.js";

// This public key is provided by the StopCovid app
// Licensed under Mozilla Public License
// See: https://gitlab.inria.fr/stopcovid19/stopcovid-android/-/raw/master/stopcovid/src/main/assets/Certs/dcc-certs.json
const PUB_KEY_ID = `-----BEGIN CERTIFICATE-----
MIIEGzCCAgOgAwIBAgIUNWO7+/2lmGQGT1cep5petfsOFocwDQYJKoZIhvcNAQELBQAwMjELMAkGA1UEBhMCRlIxDTALBgNVBAoMBEdvdXYxFDASBgNVBAMMC0NTQ0EtRlJBTkNFMB4XDTIxMDYxNDIyMDAwMFoXDTIzMDYxNDIyMDAwMFowRTELMAkGA1UEBhMCRlIxDTALBgNVBAoMBENOQU0xEjAQBgNVBAsMCTE4MDAzNTAyNDETMBEGA1UEAwwKRFNDX0ZSXzAxOTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCJiBWroM8AeX/1cn0Nyk300qLpMAD1UoB2Vq7a3No+BbgFKcPzm0ZwPaQYzfx3VHNc3JfUjv77AhJx5F4cY8+GjgeAwgd0wHQYDVR0OBBYEFF6mKwOiAheaIxTCkdVKd8zgd7urMB8GA1UdIwQYMBaAFL6KLtbJ+SBOOicDCJdN7P3ZfcXmMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMC0GA1UdHwQmMCQwIqAgoB6GHGh0dHA6Ly9hbnRzLmdvdXYuZnIvY3NjYV9jcmwwGAYDVR0gBBEwDzANBgsqgXoBgUgfAwkBATA0BggrBgEFBQcBAQQoMCYwJAYIKwYBBQUHMAKGGGh0dHBzOi8vYW50LmdvdXYuZnIvY3NjYTANBgkqhkiG9w0BAQsFAAOCAgEAu8BaLZXFj9/e2/a59mBrOhY2m5SpcAoayxF3zOkIOt7LNX0QqHuomOyGLHMnAhNALgS2vhDXD0hhs96ZcKaystlMePpYsVRyaYa53GwMrGHiLwFxH5qQNClCcktAP++wCcdQXzTyZOn9/GNdmquW1PNMLPCEfqlnzWawdpITr+CYMXa9R5BEMmdX19F41HcoPRn9/X2uHW/ONmBywTwJ3s0U8F5HF21buZtxVDvX4ey+qINBru4MiGwgRCsklS9kDbl3ODUox0lwhs2VgQzqjALF4xYgsdN2LJezrwAiL8GMRAenmX9eDdgzMGnjKFT6yW8BCrPsyUnM15RAou3BrwIp6oxXHnR8wbeKG7pzZZY1J4zk4yYyihwxguWbUZGksJsNAQoNdNHBZtc8a7Oj5onLyUIetd7ELXxdk8uy7WVFeye5V8qJRhWrFyhWWFscQeY8GktefXiGEh6fxGfRU5R5b0PznxfMiA3olad3s17dr+jzqCM/hcY2FmUTjYrSrAyrhHdmCYIJ3US71If74UeMs6NZnQRRiu3tbAX+TiDOHsEHEIOHldbyQqFfclyiC26fHTqcNfIAxXPmPDQ1jpEmhRjFDlOWHoSnzsGZi/wa1kmSb6+2uHgUP/C/O2oi+yAk8GpwpEi8Sgv+HH/p7z0ympQK8IUOG/4K3/urdto=
-----END CERTIFICATE-----`;

const cert = Certificate.fromPEM(PUB_KEY_ID);
const fingerprint = rawHash().update(cert.raw).digest();
const keyID = fingerprint.slice(0, 8);
const pk = cert.publicKey.keyRaw;
const _keyB = Buffer.from(pk.slice(0, 1));
const keyX = Buffer.from(pk.slice(1, 1 + 32));
const keyY = Buffer.from(pk.slice(33, 33 + 32));

var data = Buffer.from(PASS).toString("ASCII");

if (data.startsWith("HC1")) {
  data = data.substring(3);
  if (data.startsWith(":")) {
    data = data.substring(1);
  } else {
    console.warn("Warning: unsafe HC1: header. Expected version: v0.0.4");
  }
} else {
  console.warn("Warning: no HC1: header. Expected version: v0.0.4");
}

data = _decode(data);

// Zlib magic headers:
// 78 01 - No Compression/low
// 78 9C - Default Compression
// 78 DA - Best Compression
//
if (data[0] == 0x78) {
  data = inflate(data);
}

const verifier = { key: { x: keyX, y: keyY, kid: keyID } };

async function asyncCall() {
  try {
    const buffer = await sign.verify(data, verifier);
    const entries = await decode(Buffer.from(buffer));
    //const entries = Buffer.decode(buffer);
  
    console.log(util.inspect(entries, true, 10, true));
  } catch (err) {
    console.error(err.message);
    console.error(err.stack);
  }
}

asyncCall();

