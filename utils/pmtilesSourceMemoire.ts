import type { RangeResponse, Source } from 'pmtiles'

// pmtiles lit ses tuiles par requêtes HTTP « Range » (bytes=X-Y), relayées par le Service
// Worker (workbox CacheFirst + rangeRequests). Cette combinaison Range + Cache Storage est
// une zone connue pour être peu fiable sur Safari/iOS : le fichier peut être entièrement en
// cache et le découpage échouer quand même une fois hors ligne. Le fichier de tuiles étant
// petit (quelques Mo), on le garde entier en mémoire et on découpe les octets nous-mêmes en
// JS, ce qui élimine complètement la dépendance au découpage Range du Service Worker.
export class SourcePmtilesMemoire implements Source {
  constructor(
    private readonly cle: string,
    private readonly tampon: ArrayBuffer,
  ) {}

  getKey(): string {
    return this.cle
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    return { data: this.tampon.slice(offset, offset + length) }
  }
}
