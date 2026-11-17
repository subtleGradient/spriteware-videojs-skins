# Aqua motion study

Original procedural test footage generated for Tom's aqua Y2K Video.js skin prototype. The visual scene contains moving chrome orbs and cyan/magenta caustic ribbons against a dark blue studio background. The synthetic reflected studio moves across the spheres, making actual video-frame sampling in the player controls easy to see.

- `aqua-motion.mp4`: 24 seconds, 960 × 540, 24 fps, H.264/yuv420p, SDR, stereo AAC. Fast-start metadata. Loop-ready periodic animation.
- `poster.jpg`: frame at 4 seconds.
- `generate-video.py`: complete reproducible source. Requires Python, NumPy, and FFmpeg.
- Audio is an intentionally quiet, original synthesized ambient chord. Start muted in the browser; allow user-controlled sound.

No third-party video, music, images, fonts, or samples were used. This generated asset can be bundled with this prototype and its submission; no external stock attribution or music license is required. It is NOT an HDR video or evidence of HDR display output. Bundle same-origin to avoid cross-origin restrictions when drawing video frames into canvas/WebGL.

The scene is a synthetic visual test loop, not a filmed scene. Playback loops exactly at the animation period; codec/audio padding may create a tiny boundary artifact in some players.
