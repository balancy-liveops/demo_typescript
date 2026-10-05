// Stopgap until the SDK's web shell supplies box-sizing (plugin_cpp_typescript fix/web-shell-box-sizing): the
// bridge strips each view's own `* { box-sizing: border-box }`, so give every persistent shell the rule back.
// Watches the whole page: the shell lives in #device-wrapper in Dashboard mode and in <body> in Console mode.
export function restoreShellBoxSizing(root: Node = document.body): () => void {
    const patch = (frame: HTMLIFrameElement) => {
        const doc = frame.contentDocument;
        if (!doc?.documentElement?.hasAttribute('data-balancy-shell') || doc.getElementById('shell-box-sizing')) return;
        const style = doc.createElement('style');
        style.id = 'shell-box-sizing';
        style.textContent = '*, *::before, *::after { box-sizing: border-box; }';
        doc.head.appendChild(style);
    };
    const watch = (frame: HTMLIFrameElement) => {
        frame.addEventListener('load', () => patch(frame));
        patch(frame);
    };
    const scan = (node: Node) => {
        if (node instanceof HTMLIFrameElement) watch(node);
        else if (node instanceof Element) node.querySelectorAll('iframe').forEach(watch);
    };
    scan(root);
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(scan)));
    observer.observe(root, {childList: true, subtree: true});
    return () => observer.disconnect();
}
