export default async function Image() {
  const svg = `<?xml version="1.0" encoding="utf-8"?><svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect width='100%' height='100%' fill='#000'/><text x='50%' y='50%' fill='#fff' font-size='42' dominant-baseline='middle' text-anchor='middle'>${process.env.SITE_NAME || 'Site'}</text></svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml'
    }
  });
}
