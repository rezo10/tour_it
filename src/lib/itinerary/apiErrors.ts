/** Plan üretimi API yanıtları için sade Türkçe mesajlar (UI) */

export function friendlyPlanGenerateError(
  status: number,
  payload: { error?: string; code?: string },
): string {
  const raw = typeof payload.error === "string" ? payload.error.trim() : "";
  const looksTechnical =
    raw.length > 280 ||
    /GoogleGenerativeAI|generativelanguage\.googleapis|v1beta|Error fetching|stack|JSON\.parse/i.test(
      raw,
    );

  if (raw && !looksTechnical) {
    return raw;
  }

  if (status === 401) {
    return "Plan üretmek için önce giriş yapmalısın.";
  }
  if (status === 429 || payload.code === "GEMINI_QUOTA") {
    return "Şu an çok yoğunuz veya günlük ücretsiz kota doldu. Biraz bekleyip tekrar dene.";
  }
  if (status === 400) {
    return "Ülke, şehir ve gezi türünü seçmelisin.";
  }
  if (status === 422) {
    return "Plan düzgün oluşmadı. Tekrar üretmeyi dene.";
  }
  if (status === 500) {
    return "Sunucuda yapay zeka anahtarı eksik. Ayarları kontrol et.";
  }
  if (status === 502 || status === 503) {
    return "Bağlantı koptu veya yapay zeka yanıt vermedi. İnternetini kontrol edip tekrar dene.";
  }

  return "Bir şeyler ters gitti. Sayfayı yenileyip tekrar dene.";
}

export function friendlyNetworkError(): string {
  return "İnternet bağlantısı yok veya sunucuya ulaşılamadı. Kontrol edip tekrar dene.";
}
