export type MusicSearchResult = {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string | null;
};

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  try {
    const encodedArtist = encodeURIComponent(artist.trim());
    const encodedTitle = encodeURIComponent(title.trim());
    const response = await fetch(`https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (json.error || !json.lyrics) return null;
    return (json.lyrics as string).trim() || null;
  } catch {
    return null;
  }
}

export async function searchMusic(query: string): Promise<MusicSearchResult[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=music&limit=15&country=BR`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Erro ao buscar musicas');

  const json = await response.json();
  const seen = new Set<string>();
  const results: MusicSearchResult[] = [];

  for (const item of json.results ?? []) {
    const key = `${item.artistName}::${item.trackName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName ?? '',
      artworkUrl: item.artworkUrl60 ?? null,
    });
  }

  return results;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function buildCifrasClubUrl(artist: string, title: string): string {
  return `https://www.cifraclub.com.br/${slugify(artist)}/${slugify(title)}/`;
}
