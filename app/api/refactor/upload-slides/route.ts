import { NextRequest } from 'next/server'
import { writeFile, mkdir, readdir } from 'fs/promises'
import { join } from 'path'

const SLIDES_DIR = join(process.cwd(), 'slides-for-analysis')

export async function POST(req: NextRequest) {
  await mkdir(SLIDES_DIR, { recursive: true })

  const formData = await req.formData()
  const saved: string[] = []

  for (const [, value] of formData.entries()) {
    if (!(value instanceof File)) continue
    const buf = Buffer.from(await value.arrayBuffer())
    // Preserve original name but sanitize
    const safe = value.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    await writeFile(join(SLIDES_DIR, safe), buf)
    saved.push(safe)
  }

  return Response.json({ saved, total: saved.length })
}

export async function GET() {
  try {
    const files = (await readdir(SLIDES_DIR)).filter((f) =>
      /\.(png|jpe?g|webp|gif)$/i.test(f),
    )
    return Response.json({ files, dir: SLIDES_DIR, total: files.length })
  } catch {
    return Response.json({ files: [], dir: SLIDES_DIR, total: 0 })
  }
}
