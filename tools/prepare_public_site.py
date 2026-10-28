"""Validate and stage only public pages and referenced assets; no dependencies.

The output must be a new directory: never removes or merges an existing build.
"""
import argparse
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = ('index.html', 'about/index.html', 'nsc3/index.html',
         'locust-swarm/index.html', 'usability-toolset/index.html', 'bi-reporting/index.html')


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.refs, self.images = [], [], []
        self.headings = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        self.headings += tag == 'h1'
        for attr in ('src', 'href', 'poster'):
            if attr in attrs:
                self.refs.append(attrs[attr])
        if tag == 'img':
            self.images.append(attrs)


def resolve(source, reference):
    url = urlsplit(reference)
    if url.scheme or url.netloc:
        return None
    if url.path.startswith('/'):
        raise ValueError(f'Root-relative path breaks GitHub Pages: {reference}')
    target = ((source.parent / unquote(url.path)) if url.path else source).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError(f'Reference leaves site: {reference}')
    if target.is_dir():
        target /= 'index.html'
    if not target.is_file():
        raise ValueError(f'Missing target: {source.relative_to(ROOT)} -> {reference}')
    return target, url.fragment


def collect():
    pages = {ROOT / name: Page((ROOT / name).read_text(encoding='utf-8')) for name in PAGES}
    selected = set(pages) | {ROOT / 'assets/images/social-preview.jpg'}
    for path, page in pages.items():
        if page.headings != 1 or len(page.ids) != len(set(page.ids)):
            raise ValueError(f'Heading or duplicate ID problem: {path}')
        for image in page.images:
            if not all(key in image for key in ('alt', 'width', 'height')):
                raise ValueError(f'Missing image accessibility/dimensions: {path}')
        for reference in page.refs:
            resolved = resolve(path, reference)
            if not resolved:
                continue
            target, fragment = resolved
            if target.suffix == '.html':
                if target not in pages:
                    raise ValueError(f'Unexpected public page: {target}')
                if fragment and unquote(fragment) not in pages[target].ids:
                    raise ValueError(f'Missing anchor: {reference}')
            elif not target.relative_to(ROOT).as_posix().startswith('assets/'):
                raise ValueError(f'Unexpected public dependency: {target}')
            selected.add(target)
    pending = [p for p in selected if p.suffix == '.css']
    while pending:
        path = pending.pop()
        for reference in re.findall(r'url\(\s*[\"\x27]?(.*?)[\"\x27]?\s*\)', path.read_text(encoding='utf-8')):
            resolved = resolve(path, reference)
            if not resolved:
                continue
            target, _ = resolved
            if not target.relative_to(ROOT).as_posix().startswith('assets/'):
                raise ValueError(f'Unexpected CSS dependency: {target}')
            if target not in selected and target.suffix == '.css':
                pending.append(target)
            selected.add(target)
    return sorted(selected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    files = collect()
    if args.output:
        dest = args.output.resolve()
        if dest.exists():
            raise ValueError('Output must be a new directory')
        dest.mkdir(parents=True)
        for source in files:
            target = dest / source.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
        (dest / '.nojekyll').touch()
    print(json.dumps({'pages': len(PAGES), 'public_files': len(files),
                      'bytes': sum(p.stat().st_size for p in files),
                      'files': [p.relative_to(ROOT).as_posix() for p in files]}, indent=2))


if __name__ == '__main__':
    main()
