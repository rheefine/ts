export function createElement(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}

export function renderToString(html: string): string {
  return html.trim();
}
