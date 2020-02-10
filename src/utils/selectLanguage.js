export default function selectLanguage(supportedLangs, preferredLangs) {
  for (const preferred of preferredLangs) {
    for (const supported of supportedLangs) {
      if (match(supported, preferred)) {
        return supported;
      }
    }
  }
}

function match(supported, preferred) {
  const s = parse(supported);
  const p = parse(preferred);
  if (!p[1]) {
    return p[0] == s[0];
  } else {
    return preferred == supported;
  }
}

function parse(code) {
  code.match(/^([^-]+)(.*)$/);
  return [ RegExp.$1, RegExp.$2 ];
}
