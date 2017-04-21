export function encode(str) {
  let hash = 0, chr;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

export function getVisitedPosts() {
    return JSON.parse(localStorage.getItem("vp")) || [];
}

export function visitPost(post) {
    let visited = getVisitedPosts();
    const encoded = encode(post);
    if (!visited.includes(encoded)) {
        visited.push(encoded);
        localStorage.setItem("vp", JSON.stringify(visited));
    }
    return visited;
}

export function isPostVisited(post) {
    if (process.env.BROWSER) {
        return getVisitedPosts().includes(encode(post));
    }
    return false;
}
