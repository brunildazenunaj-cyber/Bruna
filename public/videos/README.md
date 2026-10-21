# Owner-supplied registration tutorial

The owner's `IMG_4549.MOV`, supplied through their Google Drive link, is now integrated. No substitute footage was used.

- Original downloaded file: 79,905,352 bytes; preserved unchanged at `/workspace/bmm-source-assets/IMG_4549.MOV` in the development workspace and in the owner's Drive storage. The original is not committed or publicly served by the website.
- Public delivery file: `public/videos/bmm-registration.mp4`, 10,121,125 bytes (9.65 MiB), approximately 87% smaller.
- Duration: 301.633 seconds (5:02); resolution: 1280×800; H.264 video with yuv420p pixels and AAC audio.
- Fast-start MP4: the `moov` metadata precedes `mdat` media so playback does not require the entire file to download.
- Neutral BMM poster: `public/videos/bmm-registration-poster.svg`.
- No captions were supplied. The component supports genuine `bmm-registration.sq.vtt` and `bmm-registration.en.vtt` files when available; no captions or alternate-language audio have been invented.

Conversion used:

```sh
ffmpeg -i /workspace/bmm-source-assets/IMG_4549.MOV \
  -map 0:v:0 -map '0:a:0?' -c:v libx264 -threads 3 -preset medium -crf 25 \
  -pix_fmt yuv420p -c:a aac -b:a 96k -map_metadata -1 -movflags +faststart \
  public/videos/bmm-registration.mp4
```

SHA-256:
- Original: `f52d589322ebeba9ac8268415595e1ab94809123b6cdb01ef8f405eb668123af`
- Delivery: `97c8e02727bde0901ebf282de4045d6cf894a9bf0bb8280f7ef5cbbde31b05d5`

The homepage detects the MP4 at build time. The normal Next.js/Vercel build activates the real native player. It has controls, inline mobile playback, an accessible description and direct-file fallback, `preload="none"`, and no autoplay. No Google embed or third-party video cookies are required. A missing-asset fallback is retained for a future accidental removal.

Keep the original in owner-controlled storage. Future replacement footage should be reviewed, converted into a separate delivery copy, built and tested before publishing. Rebuild after adding captions. The current 9.65 MiB file fits ordinary GitHub and Vercel static-asset limits without Git LFS.
