const list = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = list.find((item) => item.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve) => pending.set(messageId, resolve));
}
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
});
await new Promise((resolve) => ws.addEventListener('open', resolve));
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
await new Promise((resolve) => setTimeout(resolve, 2500));
const result = await send('Runtime.evaluate', {
  expression: `(() => {
    const pick = (el) => el ? { w: el.getBoundingClientRect().width, sw: el.scrollWidth, cw: el.clientWidth } : null;
    return JSON.stringify({
      inner: window.innerWidth,
      doc: document.documentElement.scrollWidth,
      login: pick(document.querySelector('.sh-login')),
      visual: pick(document.querySelector('.sh-login-visual')),
      panel: pick(document.querySelector('.sh-login-panel')),
      card: pick(document.querySelector('.sh-login-card')),
      desc: pick(document.querySelector('.sh-login-desc')),
      logo: pick(document.querySelector('.sh-login-logo')),
      input: pick(document.querySelector('.sh-login-form input')),
      descText: document.querySelector('.sh-login-desc')?.textContent,
    });
  })()`,
  returnByValue: true,
});
console.log(result.result?.result?.value || JSON.stringify(result));
ws.close();
process.exit(0);
