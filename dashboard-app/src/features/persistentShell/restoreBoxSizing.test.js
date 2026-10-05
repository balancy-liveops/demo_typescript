import { restoreShellBoxSizing } from './restoreBoxSizing';

// Stopgap for SDK 1.9.5, whose web shell drops the box-sizing views are authored with.
const flush = () => new Promise(resolve => setTimeout(resolve, 0)); // deliver MutationObserver records
const rule = frame => frame.contentDocument.getElementById('shell-box-sizing');

let stop, holder;
beforeEach(() => {
  stop = restoreShellBoxSizing();
  holder = document.body.appendChild(document.createElement('div'));
});
afterEach(() => { stop(); holder.remove(); });

test('gives a persistent shell added anywhere in the page border-box sizing once it loads', async () => {
  const shell = holder.appendChild(document.createElement('iframe'));
  await flush();
  shell.contentDocument.documentElement.setAttribute('data-balancy-shell', ''); // the shell's srcdoc has loaded
  shell.dispatchEvent(new Event('load'));
  expect(rule(shell)?.textContent).toContain('box-sizing: border-box');
});

test('finds shells inside a subtree added at once', async () => {
  const subtree = document.createElement('div');
  const shell = subtree.appendChild(document.createElement('iframe'));
  holder.appendChild(subtree);
  await flush();
  shell.contentDocument.documentElement.setAttribute('data-balancy-shell', '');
  shell.dispatchEvent(new Event('load'));
  expect(rule(shell)).not.toBeNull();
});

test('leaves classic view iframes alone', async () => {
  const view = holder.appendChild(document.createElement('iframe'));
  await flush();
  view.dispatchEvent(new Event('load'));
  expect(rule(view)).toBeNull();
});
