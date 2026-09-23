/**
 * Copy for the route error boundary, app/[locale]/error.tsx.
 *
 * Kept out of messages/<locale>.json on purpose. The boundary has to render
 * when next-intl itself is what failed (a missing message key is one of the
 * errors it reports), so it cannot ask next-intl for its words. This module is
 * plain data with no imports, which is the only kind of dependency the
 * boundary is allowed.
 *
 * A locale that is not listed here gets English. That is the expected state
 * for a newly added locale until someone writes its entry, not an error.
 */
export type RouteErrorCopy = {
  eyebrow: string;
  /** The heading is titleStart + <emphasis>titleEmphasis</emphasis> + titleEnd. */
  titleStart: string;
  titleEmphasis: string;
  titleEnd: string;
  lead: string;
  tryAgain: string;
  home: string;
  /** Shown in the details block when the error carries no message. */
  noMessage: string;
};

export const ROUTE_ERROR_COPY: Record<string, RouteErrorCopy> = {
  en: {
    eyebrow: "Something broke",
    titleStart: "This page stopped ",
    titleEmphasis: "halfway",
    titleEnd: "",
    lead: "Not your connection. Something in the page threw an error and could not finish drawing. Trying again usually works, and the details below are what we need to stop it happening twice.",
    tryAgain: "Try again",
    home: "Back to the homepage",
    noMessage: "No message was attached to the error.",
  },
  nl: {
    eyebrow: "Er ging iets mis",
    titleStart: "Deze pagina stopte ",
    titleEmphasis: "halverwege",
    titleEnd: "",
    lead: "Het ligt niet aan je verbinding. Iets op de pagina gaf een fout en kon niet verder tekenen. Opnieuw proberen werkt meestal, en de details hieronder hebben we nodig om te voorkomen dat het nog eens gebeurt.",
    tryAgain: "Opnieuw proberen",
    home: "Terug naar de homepage",
    noMessage: "Er was geen bericht aan de fout gekoppeld.",
  },
  de: {
    eyebrow: "Etwas ist schiefgelaufen",
    titleStart: "Diese Seite ist ",
    titleEmphasis: "auf halbem Weg",
    titleEnd: " stehen geblieben",
    lead: "Es liegt nicht an deiner Verbindung. Etwas auf der Seite hat einen Fehler ausgelöst und konnte nicht fertig gezeichnet werden. Ein neuer Versuch klappt meistens, und die Details unten brauchen wir, damit es nicht noch einmal passiert.",
    tryAgain: "Erneut versuchen",
    home: "Zurück zur Startseite",
    noMessage: "Zu diesem Fehler wurde keine Meldung mitgeliefert.",
  },
  es: {
    eyebrow: "Algo se rompió",
    titleStart: "Esta página se detuvo ",
    titleEmphasis: "a medias",
    titleEnd: "",
    lead: "No es tu conexión. Algo en la página produjo un error y no pudo terminar de mostrarse. Volver a intentarlo suele funcionar, y los detalles de abajo son lo que necesitamos para que no vuelva a pasar.",
    tryAgain: "Intentar de nuevo",
    home: "Volver a la página de inicio",
    noMessage: "El error no incluía ningún mensaje.",
  },
  fr: {
    eyebrow: "Quelque chose a cassé",
    titleStart: "Cette page s'est arrêtée ",
    titleEmphasis: "à mi-chemin",
    titleEnd: "",
    lead: "Ce n'est pas votre connexion. Un élément de la page a déclenché une erreur et n'a pas pu finir de s'afficher. Réessayer fonctionne généralement, et les détails ci-dessous nous aident à éviter que cela se reproduise.",
    tryAgain: "Réessayer",
    home: "Retour à l'accueil",
    noMessage: "Aucun message n'accompagnait l'erreur.",
  },
  zh: {
    eyebrow: "出了点问题",
    titleStart: "页面",
    titleEmphasis: "加载到一半",
    titleEnd: "就停止了",
    lead: "不是你的网络问题。页面中的某个部分出错，未能完成渲染。重试通常就能解决，下方的详细信息能帮助我们避免问题再次发生。",
    tryAgain: "重试",
    home: "返回首页",
    noMessage: "该错误未附带任何信息。",
  },
  ja: {
    eyebrow: "問題が発生しました",
    titleStart: "このページは",
    titleEmphasis: "途中で",
    titleEnd: "止まってしまいました",
    lead: "接続の問題ではありません。ページ内でエラーが発生し、表示を完了できませんでした。再試行すれば通常は解決します。下の詳細は、同じ問題を繰り返さないために私たちが必要とする情報です。",
    tryAgain: "再試行",
    home: "ホームページに戻る",
    noMessage: "このエラーにはメッセージが含まれていませんでした。",
  },
  ko: {
    eyebrow: "문제가 발생했습니다",
    titleStart: "이 페이지가 ",
    titleEmphasis: "중간에",
    titleEnd: " 멈췄습니다",
    lead: "연결 문제가 아닙니다. 페이지의 일부에서 오류가 발생해 화면을 끝까지 그리지 못했습니다. 다시 시도하면 대부분 해결되며, 아래 세부 정보는 같은 문제가 다시 생기지 않도록 하는 데 필요합니다.",
    tryAgain: "다시 시도",
    home: "홈페이지로 돌아가기",
    noMessage: "이 오류에는 메시지가 첨부되지 않았습니다.",
  },
  tr: {
    eyebrow: "Bir şeyler bozuldu",
    titleStart: "Bu sayfa ",
    titleEmphasis: "yarıda",
    titleEnd: " kaldı",
    lead: "Sorun bağlantında değil. Sayfadaki bir şey hata verdi ve çizimi tamamlayamadı. Yeniden denemek genellikle işe yarar; aşağıdaki ayrıntılar, bunun bir daha olmaması için ihtiyacımız olan bilgiler.",
    tryAgain: "Tekrar dene",
    home: "Ana sayfaya dön",
    noMessage: "Hataya herhangi bir mesaj eklenmemişti.",
  },
  it: {
    eyebrow: "Qualcosa si è rotto",
    titleStart: "Questa pagina si è fermata ",
    titleEmphasis: "a metà",
    titleEnd: "",
    lead: "Non è la tua connessione. Qualcosa nella pagina ha generato un errore e non è riuscito a finire di disegnarla. Riprovare di solito funziona, e i dettagli qui sotto sono quello che ci serve per evitare che succeda di nuovo.",
    tryAgain: "Riprova",
    home: "Torna alla home",
    noMessage: "All'errore non era allegato alcun messaggio.",
  },
  pt: {
    eyebrow: "Algo quebrou",
    titleStart: "Esta página parou ",
    titleEmphasis: "no meio do caminho",
    titleEnd: "",
    lead: "Não é a sua conexão. Algo na página gerou um erro e não conseguiu terminar de desenhá-la. Tentar de novo costuma resolver, e os detalhes abaixo são o que precisamos para evitar que aconteça outra vez.",
    tryAgain: "Tentar de novo",
    home: "Voltar ao início",
    noMessage: "Nenhuma mensagem foi anexada ao erro.",
  },
  pl: {
    eyebrow: "Coś się zepsuło",
    titleStart: "Ta strona zatrzymała się ",
    titleEmphasis: "w połowie",
    titleEnd: "",
    lead: "To nie wina twojego połączenia. Coś na stronie zgłosiło błąd i nie dało się jej dokończyć. Ponowna próba zwykle pomaga, a szczegóły poniżej są tym, czego potrzebujemy, żeby to się nie powtórzyło.",
    tryAgain: "Spróbuj ponownie",
    home: "Wróć na stronę główną",
    noMessage: "Do błędu nie dołączono żadnego komunikatu.",
  },
  sv: {
    eyebrow: "Något gick sönder",
    titleStart: "Den här sidan stannade ",
    titleEmphasis: "halvvägs",
    titleEnd: "",
    lead: "Det är inte din anslutning. Något på sidan kastade ett fel och kunde inte rita klart. Att försöka igen brukar fungera, och detaljerna nedan är det vi behöver för att det inte ska hända igen.",
    tryAgain: "Försök igen",
    home: "Tillbaka till startsidan",
    noMessage: "Inget meddelande följde med felet.",
  },
  fi: {
    eyebrow: "Jokin meni rikki",
    titleStart: "Tämä sivu pysähtyi ",
    titleEmphasis: "puolivälissä",
    titleEnd: "",
    lead: "Vika ei ole yhteydessäsi. Jokin sivulla aiheutti virheen, eikä sivua saatu piirrettyä loppuun. Uusi yritys toimii yleensä, ja alla olevien tietojen avulla estämme saman toistumisen.",
    tryAgain: "Yritä uudelleen",
    home: "Takaisin etusivulle",
    noMessage: "Virheen mukana ei ollut viestiä.",
  },
  et: {
    eyebrow: "Midagi läks katki",
    titleStart: "See leht peatus ",
    titleEmphasis: "poolel teel",
    titleEnd: "",
    lead: "Asi pole sinu ühenduses. Miski lehel andis vea ega saanud joonistamist lõpetada. Uus katse tavaliselt aitab ja allolevaid üksikasju vajame, et see teist korda ei juhtuks.",
    tryAgain: "Proovi uuesti",
    home: "Tagasi avalehele",
    noMessage: "Veaga ei olnud kaasas ühtegi teadet.",
  },
  hu: {
    eyebrow: "Valami elromlott",
    titleStart: "Ez az oldal ",
    titleEmphasis: "félúton",
    titleEnd: " megállt",
    lead: "Nem a kapcsolatoddal van a baj. Az oldalon valami hibát dobott, és nem tudta befejezni a megjelenítést. Az újrapróbálás általában működik, az alábbi részletekre pedig azért van szükségünk, hogy ne forduljon elő még egyszer.",
    tryAgain: "Újrapróbálás",
    home: "Vissza a főoldalra",
    noMessage: "A hibához nem tartozott üzenet.",
  },
  el: {
    eyebrow: "Κάτι χάλασε",
    titleStart: "Αυτή η σελίδα σταμάτησε ",
    titleEmphasis: "στη μέση",
    titleEnd: "",
    lead: "Δεν φταίει η σύνδεσή σου. Κάτι στη σελίδα προκάλεσε σφάλμα και δεν μπόρεσε να ολοκληρώσει την εμφάνισή της. Μια νέα προσπάθεια συνήθως αρκεί, και οι λεπτομέρειες παρακάτω είναι αυτό που χρειαζόμαστε για να μην ξανασυμβεί.",
    tryAgain: "Δοκίμασε ξανά",
    home: "Πίσω στην αρχική",
    noMessage: "Δεν υπήρχε μήνυμα συνημμένο στο σφάλμα.",
  },
  hr: {
    eyebrow: "Nešto se pokvarilo",
    titleStart: "Ova se stranica zaustavila ",
    titleEmphasis: "na pola puta",
    titleEnd: "",
    lead: "Nije do tvoje veze. Nešto na stranici izazvalo je pogrešku i nije moglo dovršiti prikaz. Ponovni pokušaj obično pomogne, a pojedinosti ispod su ono što nam treba da se to ne ponovi.",
    tryAgain: "Pokušaj ponovno",
    home: "Natrag na početnu",
    noMessage: "Uz pogrešku nije bila priložena nikakva poruka.",
  },
  sl: {
    eyebrow: "Nekaj se je pokvarilo",
    titleStart: "Ta stran se je ustavila ",
    titleEmphasis: "na pol poti",
    titleEnd: "",
    lead: "Ne gre za tvojo povezavo. Nekaj na strani je sprožilo napako in je ni moglo dokončno prikazati. Ponoven poskus običajno pomaga, podrobnosti spodaj pa potrebujemo, da se to ne bi ponovilo.",
    tryAgain: "Poskusi znova",
    home: "Nazaj na domačo stran",
    noMessage: "Napaki ni bilo priloženo nobeno sporočilo.",
  },
  sq: {
    eyebrow: "Diçka u prish",
    titleStart: "Kjo faqe u ndal ",
    titleEmphasis: "në gjysmë të rrugës",
    titleEnd: "",
    lead: "Nuk është lidhja jote. Diçka në faqe shkaktoi një gabim dhe nuk arriti ta përfundonte shfaqjen. Zakonisht mjafton të provosh sërish, dhe detajet më poshtë janë ato që na duhen që kjo të mos ndodhë përsëri.",
    tryAgain: "Provo sërish",
    home: "Kthehu në kreu",
    noMessage: "Gabimi nuk kishte asnjë mesazh bashkëngjitur.",
  },
  "sr-Latn": {
    eyebrow: "Nešto se pokvarilo",
    titleStart: "Ova stranica se zaustavila ",
    titleEmphasis: "na pola puta",
    titleEnd: "",
    lead: "Nije do vaše veze. Nešto na stranici je izazvalo grešku i nije moglo da završi prikaz. Ponovni pokušaj obično pomaže, a detalji ispod su ono što nam treba da se to ne bi ponovilo.",
    tryAgain: "Pokušajte ponovo",
    home: "Nazad na početnu",
    noMessage: "Uz grešku nije bila priložena nikakva poruka.",
  },
  "sr-Cyrl": {
    eyebrow: "Нешто се покварило",
    titleStart: "Ова страница се зауставила ",
    titleEmphasis: "на пола пута",
    titleEnd: "",
    lead: "Није до ваше везе. Нешто на страници је изазвало грешку и није могло да заврши приказ. Поновни покушај обично помаже, а детаљи испод су оно што нам треба да се то не би поновило.",
    tryAgain: "Покушајте поново",
    home: "Назад на почетну",
    noMessage: "Уз грешку није била приложена никаква порука.",
  },
  uk: {
    eyebrow: "Щось зламалося",
    titleStart: "Ця сторінка зупинилася ",
    titleEmphasis: "на півдорозі",
    titleEnd: "",
    lead: "Справа не у вашому з'єднанні. Щось на сторінці спричинило помилку й не змогло завершити відображення. Повторна спроба зазвичай допомагає, а подробиці нижче потрібні нам, щоб це не повторилося.",
    tryAgain: "Спробувати ще раз",
    home: "На головну",
    noMessage: "До помилки не було додано жодного повідомлення.",
  },
  ru: {
    eyebrow: "Что-то сломалось",
    titleStart: "Эта страница остановилась ",
    titleEmphasis: "на полпути",
    titleEnd: "",
    lead: "Дело не в твоём соединении. Что-то на странице вызвало ошибку и не смогло закончить отрисовку. Повторная попытка обычно помогает, а подробности ниже нужны нам, чтобы это не повторилось.",
    tryAgain: "Попробовать снова",
    home: "На главную",
    noMessage: "К ошибке не было приложено сообщение.",
  },
  ar: {
    eyebrow: "حدث خلل ما",
    titleStart: "توقفت هذه الصفحة ",
    titleEmphasis: "في منتصف الطريق",
    titleEnd: "",
    lead: "المشكلة ليست في اتصالك. تسبب شيء في الصفحة في حدوث خطأ ولم يتمكن من إكمال عرضها. عادةً ما تنجح المحاولة مرة أخرى، والتفاصيل أدناه هي ما نحتاجه لمنع تكرار ذلك.",
    tryAgain: "حاول مرة أخرى",
    home: "العودة إلى الرئيسية",
    noMessage: "لم تُرفق أي رسالة بهذا الخطأ.",
  },
  fa: {
    eyebrow: "چیزی خراب شد",
    titleStart: "این صفحه ",
    titleEmphasis: "نیمه‌کاره",
    titleEnd: " متوقف شد",
    lead: "مشکل از اتصال تو نیست. چیزی در صفحه خطا داد و نتوانست نمایش آن را تمام کند. معمولاً تلاش دوباره جواب می‌دهد، و جزئیات زیر همان چیزی است که لازم داریم تا دوباره تکرار نشود.",
    tryAgain: "دوباره امتحان کن",
    home: "بازگشت به خانه",
    noMessage: "هیچ پیامی همراه این خطا نبود.",
  },
  id: {
    eyebrow: "Ada yang rusak",
    titleStart: "Halaman ini berhenti ",
    titleEmphasis: "di tengah jalan",
    titleEnd: "",
    lead: "Bukan koneksimu yang bermasalah. Ada bagian halaman yang memunculkan error dan tidak bisa selesai ditampilkan. Mencoba lagi biasanya berhasil, dan detail di bawah ini yang kami perlukan agar hal ini tidak terulang.",
    tryAgain: "Coba lagi",
    home: "Kembali ke Beranda",
    noMessage: "Tidak ada pesan yang menyertai error ini.",
  },
  ms: {
    eyebrow: "Ada sesuatu yang rosak",
    titleStart: "Halaman ini terhenti ",
    titleEmphasis: "separuh jalan",
    titleEnd: "",
    lead: "Bukan sambungan anda. Sesuatu dalam halaman ini menghasilkan ralat dan tidak dapat selesai dipaparkan. Mencuba semula biasanya berjaya, dan butiran di bawah ialah apa yang kami perlukan supaya ia tidak berulang.",
    tryAgain: "Cuba lagi",
    home: "Kembali ke laman utama",
    noMessage: "Tiada mesej dilampirkan pada ralat ini.",
  },
  vi: {
    eyebrow: "Đã có lỗi xảy ra",
    titleStart: "Trang này đã dừng ",
    titleEmphasis: "giữa chừng",
    titleEnd: "",
    lead: "Không phải do kết nối của bạn. Một phần trên trang đã gặp lỗi và không thể hiển thị hết. Thử lại thường sẽ được, và thông tin chi tiết bên dưới là thứ chúng tôi cần để lỗi này không lặp lại.",
    tryAgain: "Thử lại",
    home: "Về trang chủ",
    noMessage: "Lỗi này không kèm theo thông báo nào.",
  },
  th: {
    eyebrow: "เกิดข้อผิดพลาด",
    titleStart: "หน้านี้หยุด",
    titleEmphasis: "กลางคัน",
    titleEnd: "",
    lead: "ไม่ใช่ปัญหาจากการเชื่อมต่อของคุณ มีบางอย่างในหน้านี้เกิดข้อผิดพลาดและแสดงผลไม่เสร็จ ลองอีกครั้งมักจะได้ผล และรายละเอียดด้านล่างคือสิ่งที่เราต้องใช้เพื่อไม่ให้เกิดขึ้นซ้ำ",
    tryAgain: "ลองอีกครั้ง",
    home: "กลับหน้าแรก",
    noMessage: "ข้อผิดพลาดนี้ไม่มีข้อความแนบมา",
  },
  "zh-TW": {
    eyebrow: "出了點問題",
    titleStart: "這個頁面",
    titleEmphasis: "載入到一半",
    titleEnd: "就停住了",
    lead: "不是你的網路問題。頁面中的某個部分發生錯誤，沒辦法完成顯示。重試通常就能解決，下方的詳細資訊能幫助我們避免問題再次發生。",
    tryAgain: "重試",
    home: "返回首頁",
    noMessage: "這個錯誤沒有附帶任何訊息。",
  },
};

/** Looks like a locale segment ("en", "pt", "zh-TW"), not a page slug. */
const LOCALE_SEGMENT = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

/**
 * The locale for a pathname such as "/nl/whitepaper", and the copy to show.
 *
 * `locale` is the first path segment when it looks like a locale, so a locale
 * without its own entry still links home to its own homepage while reading
 * English. Anything else, including an empty or missing path, is English.
 */
export function routeErrorCopy(pathname: string | null | undefined): {
  locale: string;
  copy: RouteErrorCopy;
} {
  const segment = (pathname ?? "").split("/").filter(Boolean)[0] ?? "";
  const locale = LOCALE_SEGMENT.test(segment) ? segment : "en";
  const copy =
    (Object.prototype.hasOwnProperty.call(ROUTE_ERROR_COPY, locale) && ROUTE_ERROR_COPY[locale]) ||
    ROUTE_ERROR_COPY.en;
  return { locale, copy };
}
