# Spriteware

Illustrated player skins for Video.js v10. One shared player; artwork and layout supplied by theme manifests.

## Nebula Pop

Candy orange. Acid lime. Alien hardware. Nebula Pop turns a rendered gadget into a working video player, with image-based control states and native controls beneath the artwork.

**[Play the demo](https://subtlegradient.github.io/spriteware-videojs-skins/?skin=nebula)**

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

## Controls

Play and Pause are separate buttons. Tab between controls; Enter or Space activates buttons. Timeline arrows seek five seconds, Home and End jump to either end, and Escape closes chapter selection. iPhone may use native fullscreen and hardware volume.

## Themes

`src/player.js` contains the shared player. `src/themes/nebula.js` maps artwork and hit regions onto one coordinate system. Assets live in `public/themes/nebula`. New themes swap artwork and geometry, not playback code.

No WebGL, canvas effects, autoplay, or duplicate mobile toolbar.

## License

[Apache License 2.0](LICENSE). See [NOTICE.md](NOTICE.md) for artwork and media provenance. Dependencies retain their own licenses.
