import { ImageResponse } from 'next/og';
import LogoIcon from './icons/logo';
import { join } from 'path';
import { readFile } from 'fs/promises';

export type Props = {
  title?: string;
};

export default async function OpengraphImage(
  props?: Props
): Promise<ImageResponse> {
  const { title } = {
    ...{
      title: process.env.SITE_NAME
    },
    ...props
  };

  let fonts: any[] = [];
  try {
    const file = await readFile(join(process.cwd(), './fonts/Inter-Bold.ttf'));
    const font = Uint8Array.from(file).buffer;

    fonts.push({
      name: 'Inter',
      data: font,
      style: 'normal',
      weight: 700
    });
  } catch (err) {
    // If the font can't be read (paths with spaces, missing file, etc.),
    // proceed without custom fonts. This avoids build failures during
    // prerendering on some environments (e.g., Windows paths).
    // eslint-disable-next-line no-console
    console.warn('Could not load Inter-Bold.ttf for OG image, falling back to system fonts.', err);
  }

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col items-center justify-center bg-black">
        <div tw="flex flex-none items-center justify-center border border-neutral-700 h-[160px] w-[160px] rounded-3xl">
          <LogoIcon width="64" height="58" fill="white" />
        </div>
        <p tw="mt-12 text-6xl font-bold text-white">{title}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Only include fonts if we managed to load them
      ...(fonts.length > 0 ? { fonts } : {})
    }
  );
}
