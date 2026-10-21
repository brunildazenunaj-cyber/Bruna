# Owner-supplied registration tutorial

The original `IMG_4549.MOV` has not been supplied in this checkout. Do not substitute a different video or add an empty MP4 file.

Expected delivery file: `public/videos/bmm-registration.mp4`.
Optional real captions: `public/videos/bmm-registration.sq.vtt` and `public/videos/bmm-registration.en.vtt` (WebVTT).
A neutral BMM poster is included at `public/videos/bmm-registration-poster.svg`.

Keep the original MOV unchanged in owner-controlled storage outside the public directory. Convert a copy with FFmpeg after the owner supplies it:

```sh
ffmpeg -i /path/to/IMG_4549.MOV -map 0:v:0 -map '0:a:0?' \
  -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset medium -crf 23 \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
  public/videos/bmm-registration.mp4
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height \
  -show_entries format=duration,size -of json public/videos/bmm-registration.mp4
```

Inspect the converted video on mobile and desktop, including seeking, sound, orientation and captions. Verify the recording does not disclose real trading credentials before making it public. No footage or captions are fabricated by the application.

The homepage checks for these files at build time. Add the video (and approved captions), run `npm run build` and redeploy to activate the real player. Until then it displays a clear bilingual unavailable message and a support contact, not a broken player or fake play button. The real player uses native controls, inline mobile playback and `preload="none"`, with no autoplay.

Check the resulting file against the host's static-asset and Git file-size limits. If it exceeds those limits, use owner-authorized video/object hosting and configure its real delivery URL in a separate change; do not commit an oversize binary or an inaccessible Git LFS pointer.
