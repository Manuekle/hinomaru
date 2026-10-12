// Usage: copy next to a node_modules with @hugeicons/core-free-icons, then: node hugeicons.js <Assets.xcassets dir>
// (the package's CJS build fails on recent Node, so it is loaded as ESM)
// This wipes Assets.xcassets/Hugeicons, so re-run hugeicons_solid.py afterwards for the .fill twins.
const fs = require("fs"), path = require("path");
const map = {
  home: "Home09Icon", kana: "AlphabetJapaneseIcon", cards: "Cards01Icon", compass: "DiscoverCircleIcon",
  user: "UserCircleIcon", arrowRightCircle: "CircleArrowRight01Icon", search: "Search01Icon",
  cancelCircle: "CancelCircleIcon", cancel: "Cancel01Icon", volume: "VolumeHighIcon",
  undo: "RotateLeft01Icon", star: "StarIcon", translate: "TranslateIcon", textFont: "TextFontIcon",
  target: "Target01Icon", chevronDown: "ArrowDown01Icon", chevronLeft: "ArrowLeft01Icon",
  chevronRight: "ArrowRight01Icon", flashcards: "Cards02Icon", fire: "FireIcon", play: "PlayIcon",
  pause: "PauseIcon", checkCircle: "CheckmarkCircle02Icon", circle: "CircleIcon",
  quiz: "BubbleChatQuestionIcon", headphones: "HeadphonesIcon", link: "Link04Icon", keyboard: "KeyboardIcon",
  blocks: "BlockGameIcon", quill: "QuillWrite01Icon", kanji: "AlphabetChineseIcon", puzzle: "PuzzleIcon",
  airplane: "Airplane01Icon", view: "ViewIcon", viewOff: "ViewOffIcon", music: "MusicNote01Icon",
  mic: "Mic01Icon", badgeCheck: "CheckmarkBadge01Icon", sun: "Sun03Icon",
  exclamation: "ExclamationMarkIcon", heart: "FavouriteIcon", heartbreak: "HeartbreakIcon",
  droplet: "DropletIcon", sparkle: "SparkleIcon", turtle: "TurtleIcon", subtitle: "SubtitleIcon",
  chatDone: "BubbleChatDoneIcon", replay: "GoBackward5SecIcon", restart: "ArrowReloadHorizontalIcon",
  lock: "SquareLock02Icon", book: "BookOpen01Icon", dumbbell: "Dumbbell01Icon", crown: "CrownIcon", tick: "Tick02Icon",
  bookmark: "Bookmark02Icon", bell: "Notification01Icon", timer: "Timer02Icon",
  award: "Award01Icon", share: "Share08Icon", trash: "Delete02Icon", calendar: "Calendar03Icon", exam: "Mortarboard02Icon",
  route: "Route02Icon",
};
const STROKE = "1.8";
const attr = (k, v) => {
  const name = k.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
  if (name === "key") return "";
  if (name === "stroke-width") v = STROKE;
  if (v === "currentColor") v = "#000000";
  return ` ${name}="${v}"`;
};
import("@hugeicons/core-free-icons").then((m) => {
const missing = Object.values(map).filter((icon) => !m[icon]);
if (missing.length) throw new Error("missing " + missing.join(", "));
const out = path.join(process.argv[2], "Hugeicons");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "Contents.json"), JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2));
for (const [key, icon] of Object.entries(map)) {
  const nodes = m[icon];
  const body = nodes.map(([tag, a]) => `<${tag}${Object.entries(a).map(([k, v]) => attr(k, v)).join("")}/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${body}</svg>\n`;
  const dir = path.join(out, `hi.${key}.imageset`);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `${key}.svg`), svg);
  fs.writeFileSync(path.join(dir, "Contents.json"), JSON.stringify({
    images: [{ filename: `${key}.svg`, idiom: "universal" }],
    info: { author: "xcode", version: 1 },
    properties: { "preserves-vector-representation": true, "template-rendering-intent": "template" },
  }, null, 2));
}
console.log(Object.keys(map).length, "icons");
});
