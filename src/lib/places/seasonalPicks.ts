/** Ana sayfa hero: ay bazlı “şimdi / yakında” destinasyon önerileri (statik kurallı). */

export type SeasonPick = {
  city: string;
  country: string;
  /** Kısa Türkçe gerekçe */
  why: string;
};

export type SeasonalRails = {
  /** Örn. "Mayıs 2026" */
  periodLabel: string;
  leftTitle: string;
  leftSubtitle: string;
  left: [SeasonPick, SeasonPick];
  rightTitle: string;
  rightSubtitle: string;
  right: [SeasonPick, SeasonPick];
};

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

/** Ay indeksi 0–11 için sol = bu ay, sağ = bir sonraki ay ön izleme */
const ROTATION: Array<{
  left: [SeasonPick, SeasonPick];
  right: [SeasonPick, SeasonPick];
}> = [
  {
    left: [
      { city: "Dubai", country: "United Arab Emirates", why: "Kısa kış güneşi" },
      { city: "Lisbon", country: "Portugal", why: "Ilıman kıyı, festival öncesi" },
    ],
    right: [
      { city: "Bangkok", country: "Thailand", why: "Kuru mevsim başlangıcı" },
      { city: "Cusco", country: "Peru", why: "Yağmur sonrası net manzara" },
    ],
  },
  {
    left: [
      { city: "Bangkok", country: "Thailand", why: "Konforlu sıcaklık" },
      { city: "Tokyo", country: "Japan", why: "Erguvan öncesi sakin şehir" },
    ],
    right: [
      { city: "Lima", country: "Peru", why: "Gastronomi ve sonbahar ışığı" },
      { city: "Rome", country: "Italy", why: "Kalabalık öncesi ilk bahar" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Çiğdem ve mild Güneş" },
      { city: "Kyoto", country: "Japan", why: "Kiraz çiçeği öncesi" },
    ],
    right: [
      { city: "Istanbul", country: "Türkiye", why: "Lale ve teras mevsimi" },
      { city: "Amsterdam", country: "Netherlands", why: "Lale bahçeleri" },
    ],
  },
  {
    left: [
      { city: "Istanbul", country: "Türkiye", why: "Bahar, sokak keyfi" },
      { city: "Rome", country: "Italy", why: "Açık hava akşamları" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Uzun günler, az rüzgar" },
      { city: "Athens", country: "Greece", why: "Adalar öncesi erken sezon" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Henüz yaz kalabalığı yok" },
      { city: "Copenhagen", country: "Denmark", why: "Gece ışıldayan kanallar" },
    ],
    right: [
      { city: "Barcelona", country: "Spain", why: "Deniz ve sokak festivalleri" },
      { city: "Porto", country: "Portugal", why: "Üzüm bağları başlıyor" },
    ],
  },
  {
    left: [
      { city: "Copenhagen", country: "Denmark", why: "Beyaz geceler, bisiklet" },
      { city: "Kyoto", country: "Japan", why: "Yeşil meşeler, az monsun" },
    ],
    right: [
      { city: "Florence", country: "Italy", why: "Akşam serinliği ve sanat" },
      { city: "Lima", country: "Peru", why: "Sisli kıyı, güzel fotoğraf" },
    ],
  },
  {
    left: [
      { city: "Florence", country: "Italy", why: "Açık hava konserleri" },
      { city: "Porto", country: "Portugal", why: "Douro vadisi güneşi" },
    ],
    right: [
      { city: "Cusco", country: "Peru", why: "Kuru mevsim trekking" },
      { city: "Kyoto", country: "Japan", why: "Gion bayram atmosferi" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Matsuri ve yaz gece hayatı" },
      { city: "Lima", country: "Peru", why: "Sahil sisi hafifler" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Atlantik esintisi" },
      { city: "Copenhagen", country: "Denmark", why: "Açık yüzme ve sahil" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Son yaz akşamları" },
      { city: "Rome", country: "Italy", why: "Eylül sakinliği" },
    ],
    right: [
      { city: "Kyoto", country: "Japan", why: "Sonbahar renklerine hazırlık" },
      { city: "Tokyo", country: "Japan", why: "Teknoloji fuarları" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Koyo dönemi başlar" },
      { city: "Florence", country: "Italy", why: "Şarap hasadı yakın" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Hâlâ yüzmek mümkün" },
      { city: "Porto", country: "Portugal", why: "Hasat ve köprü manzarası" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Kırmızı-turuncu tapınaklar" },
      { city: "Lisbon", country: "Portugal", why: "Son güneş ve fado" },
    ],
    right: [
      { city: "Rome", country: "Italy", why: "Az kalabalık, iyi hava" },
      { city: "Copenhagen", country: "Denmark", why: "Hygee ve Noel ışıkları" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Yılbaşı ışıkları" },
      { city: "Copenhagen", country: "Denmark", why: "Kış pazarları" },
    ],
    right: [
      { city: "Tokyo", country: "Japan", why: "Illumination sezonu" },
      { city: "Dubai", country: "United Arab Emirates", why: "Kısa güneş kaçamağı" },
    ],
  },
];

export function getSeasonalRails(now: Date): SeasonalRails {
  const m = now.getMonth();
  const y = now.getFullYear();
  const label = `${MONTHS_TR[m]} ${y}`;
  const nextM = (m + 1) % 12;
  const nextY = nextM === 0 ? y + 1 : y;
  const nextLabel = `${MONTHS_TR[nextM]} ${nextY}`;

  const row = ROTATION[m] ?? ROTATION[0];

  return {
    periodLabel: label,
    leftTitle: "Bu dönem",
    leftSubtitle: `${label} için öne çıkanlar`,
    left: row.left,
    rightTitle: "Sıradaki ay",
    rightSubtitle: `${nextLabel} için erken not`,
    right: row.right,
  };
}
